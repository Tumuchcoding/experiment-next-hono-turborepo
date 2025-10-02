import { Hono } from "hono"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { deleteSession } from "../../utils/session.util"

const routeSignout = new Hono()

routeSignout.post("/", async (context) => {
  deleteSession(context)
  return context.json({}, HTTP_STATUS_CODE["200_OK"])
})

export { routeSignout }
