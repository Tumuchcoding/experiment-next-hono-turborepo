import { ORPCError, implement } from "@orpc/server";
import { hash, verify } from "argon2";
import { ACCOUNT, PROFILE, USER, and, db, eq } from "db";
import {
  deleteSession,
  setSession,
  verifySession,
} from "../utils/session.util.js";
import {
  type AppContext,
  contract,
  schemaAuthSigninCredential,
  schemaAuthSignupCredential,
  schemaAuthVerify,
} from "./contract.js";

const implementer = implement(contract).$context<AppContext>();

const createError = (message: string, status: number, code: string) =>
  new ORPCError(code, { message, status });

const authSignupCredential = implementer.authSignupCredential.handler(
  async ({ input, context }) => {
    try {
      const { email, name, password } = schemaAuthSignupCredential.parse(input);

      const [existingUser] = await db
        .select()
        .from(USER)
        .where(eq(USER.email, email))
        .limit(1);

      if (existingUser) {
        throw createError(
          "User with this email already exists.",
          409,
          "CONFLICT"
        );
      }

      const hashedPassword = await hash(password);

      await db.transaction(async (transaction) => {
        const [newUser] = await transaction
          .insert(USER)
          .values({ email, name })
          .returning();

        const account = transaction.insert(ACCOUNT).values({
          password: hashedPassword,
          userId: newUser.id,
        });

        const profile = transaction.insert(PROFILE).values({
          userId: newUser.id,
        });

        await Promise.all([account, profile]);

        await setSession({
          context: context.honoContext,
          id: newUser.id,
          now: new Date(),
        });
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      throw createError(
        "An unexpected error occurred. Please try again later.",
        500,
        "INTERNAL_SERVER_ERROR"
      );
    }
  }
);

const authSigninCredential = implementer.authSigninCredential.handler(
  async ({ input, context }) => {
    try {
      const { email, password } = schemaAuthSigninCredential.parse(input);

      const [existingUser] = await db
        .select({
          hashedPassword: ACCOUNT.password,
          id: USER.id,
          name: USER.name,
        })
        .from(USER)
        .innerJoin(
          ACCOUNT,
          and(eq(ACCOUNT.userId, USER.id), eq(ACCOUNT.provider, "credentials"))
        )
        .where(eq(USER.email, email))
        .limit(1);

      if (!existingUser) {
        throw createError(
          "User with this email does not exist.",
          401,
          "UNAUTHORIZED"
        );
      }

      const hashedPassword = existingUser.hashedPassword ?? "";
      const isPasswordCorrect = await verify(hashedPassword, password);

      if (!isPasswordCorrect) {
        throw createError("Invalid email or password.", 401, "UNAUTHORIZED");
      }

      await setSession({
        context: context.honoContext,
        id: existingUser.id,
        now: new Date(),
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      throw createError(
        "An unexpected error occurred. Please try again later.",
        500,
        "INTERNAL_SERVER_ERROR"
      );
    }
  }
);

const authSignoutCredential = implementer.authSignoutCredential.handler(
  async ({ context }) => {
    deleteSession(context.honoContext);
    return { success: true };
  }
);

const authVerify = implementer.authVerify.handler(async ({ input }) => {
  try {
    const { session } = schemaAuthVerify.parse(input);
    if (!session) return false;

    const data = await verifySession(session);
    if (!data) return false;

    return true;
  } catch {
    return false;
  }
});

const test = implementer.test.handler(async () => "Hello Hono!");

const users = implementer.users.handler(async () => {
  const usersResult = await db.select().from(USER);
  return usersResult;
});

export const router = implementer.router({
  authSignupCredential,
  authSigninCredential,
  authSignoutCredential,
  authVerify,
  test,
  users,
});
