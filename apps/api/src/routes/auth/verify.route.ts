import { Hono } from "hono"
import { verifyMiddleware } from "../../middleware/auth.middleware.js"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code.js"
import { EmptyOk } from "./schemas.js"

const routeVerify = new Hono().get("/", verifyMiddleware, (c) => {
  const body: EmptyOk = { ok: true }
  return c.json(body, HTTP_STATUS_CODE["200_OK"])
})

export { routeVerify }
