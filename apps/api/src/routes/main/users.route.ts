import { Hono } from "hono"
import { db } from "../../utils/db/db.utils"
import { USER } from "../../utils/db/schema/user.schema"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"

const routeUsers = new Hono()

routeUsers.get("/", async (context) => {
  try {
    const users = await db.select().from(USER)
    return context.json({ users })
  } catch {
    return context.json({}, HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"])
  }
})

export { routeUsers }
