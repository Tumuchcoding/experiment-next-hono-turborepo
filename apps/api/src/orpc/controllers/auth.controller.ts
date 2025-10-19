import { Controller, Implement, ProcedureExecutionError } from "@outscope/orpc-hono"
import { hash, verify } from "argon2"
import { ACCOUNT, PROFILE, USER, and, db, eq } from "db"
import { z } from "zod"
import { contract, schemaAuthSigninCredential, schemaAuthSignupCredential, schemaAuthVerify, type AppContext } from "@/orpc/contract"
import { deleteSession, setSession, verifySession } from "@/utils/session.util"

type SignupInput = z.infer<typeof schemaAuthSignupCredential>
type SigninInput = z.infer<typeof schemaAuthSigninCredential>
type VerifyInput = z.infer<typeof schemaAuthVerify>

function createError(message: string, status: number, code: string) {
  return new ProcedureExecutionError(message, {
    code,
    status,
  })
}

@Controller()
export class AuthController {
  @Implement(contract.authSignupCredential)
  async signupCredential(input: SignupInput, context: AppContext) {
    try {
      const { email, name, password } = input

      const [existingUser] = await db
        .select()
        .from(USER)
        .where(eq(USER.email, email))
        .limit(1)

      if (existingUser) {
        throw createError("User with this email already exists.", 409, "CONFLICT")
      }

      const hashedPassword = await hash(password)

      await db.transaction(async (transaction) => {
        const [newUser] = await transaction
          .insert(USER)
          .values({ email, name })
          .returning()

        const account = transaction.insert(ACCOUNT).values({
          password: hashedPassword,
          userId: newUser.id,
        })

        const profile = transaction.insert(PROFILE).values({
          userId: newUser.id,
        })

        await Promise.all([account, profile])

        await setSession({
          context: context.honoContext,
          id: newUser.id,
          now: new Date(),
        })
      })

      return { success: true }
    } catch (error) {
      if (error instanceof ProcedureExecutionError) throw error
      throw createError(
        "An unexpected error occurred. Please try again later.",
        500,
        "INTERNAL_SERVER_ERROR",
      )
    }
  }

  @Implement(contract.authSigninCredential)
  async signinCredential(input: SigninInput, context: AppContext) {
    try {
      const { email, password } = input

      const [existingUser] = await db
        .select({
          hashedPassword: ACCOUNT.password,
          id: USER.id,
          name: USER.name,
        })
        .from(USER)
        .innerJoin(
          ACCOUNT,
          and(eq(ACCOUNT.userId, USER.id), eq(ACCOUNT.provider, "credentials")),
        )
        .where(eq(USER.email, email))
        .limit(1)

      if (!existingUser) {
        throw createError("User with this email does not exist.", 401, "UNAUTHORIZED")
      }

      const hashedPassword = existingUser.hashedPassword ?? ""
      const isPasswordCorrect = await verify(hashedPassword, password)

      if (!isPasswordCorrect) {
        throw createError("Invalid email or password.", 401, "UNAUTHORIZED")
      }

      await setSession({
        context: context.honoContext,
        id: existingUser.id,
        now: new Date(),
      })

      return { success: true }
    } catch (error) {
      if (error instanceof ProcedureExecutionError) throw error
      throw createError(
        "An unexpected error occurred. Please try again later.",
        500,
        "INTERNAL_SERVER_ERROR",
      )
    }
  }

  @Implement(contract.authSignoutCredential)
  async signoutCredential(_input: undefined, context: AppContext) {
    deleteSession(context.honoContext)
    return { success: true }
  }

  @Implement(contract.authVerify)
  async verify(input: VerifyInput) {
    try {
      const session = input.session
      if (!session) return false

      const data = await verifySession(session)
      if (!data) return false

      return true
    } catch {
      return false
    }
  }
}
