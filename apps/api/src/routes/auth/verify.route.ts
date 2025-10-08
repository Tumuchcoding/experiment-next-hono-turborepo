import { Hono } from "hono"
import { verifyMiddleware } from "../../middleware/auth.middleware"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { EmptyOk } from "./schemas"

const routeVerify = new Hono().get("/", verifyMiddleware, (c) => {
  const body: EmptyOk = { ok: true }
  return c.json(body, HTTP_STATUS_CODE["200_OK"])
})

export { routeVerify }
