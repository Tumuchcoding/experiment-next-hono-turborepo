import { Hono } from "hono"
import { verifyMiddleware } from "../../middleware/auth.middleware"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"

const routeVerify = new Hono()

routeVerify.get("/", verifyMiddleware, async (context) => {
  return context.json({}, HTTP_STATUS_CODE["200_OK"])
})

export { routeVerify }
