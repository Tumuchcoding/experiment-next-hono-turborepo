import { USER, db, eq } from "db";
import { authHandlers } from "./auth.handlers.js";
import { implementer } from "./implementer.js";

const test = implementer.test.handler(async () => "Hello Hono!");

const users = implementer.users.handler(async () => {
  const usersResult = await db.select().from(USER);
  return usersResult;
});

const userById = implementer.userById.handler(async ({ input }) => {
  const { userId } = input.params;

  const [user] = await db
    .select()
    .from(USER)
    .where(eq(USER.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
});

export const router = implementer.router({
  ...authHandlers,
  test,
  users,
  userById,
});
