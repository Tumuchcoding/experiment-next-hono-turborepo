import { USER, db } from "db";
import { authHandlers } from "./auth.handlers.js";
import { implementer } from "./implementer.js";

const test = implementer.test.handler(async () => "Hello Hono!");

const users = implementer.users.handler(async () => {
  const usersResult = await db.select().from(USER);
  return usersResult;
});

export const router = implementer.router({
  ...authHandlers,
  test,
  users,
});
