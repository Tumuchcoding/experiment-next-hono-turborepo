import { Controller, Implement } from "@outscope/orpc-hono";
import { db, USER } from "../../../../../packages/db/src/index.js";
import { contract } from "../contract.js";

@Controller()
export class AppController {
  @Implement(contract.test)
  async test() {
    return "Hello Hono!";
  }

  @Implement(contract.users)
  async users() {
    const users = await db.select().from(USER);
    return users;
  }
}
