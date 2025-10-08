import { Hono } from "hono"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code.js"
import { deleteSession } from "../../utils/session.util.js"
import { EmptyOk } from "./schemas.js"

const routeSignout = new Hono().post("/", (c) => {
  deleteSession(c)
  const body: EmptyOk = { ok: true }
  return c.json(body, HTTP_STATUS_CODE["200_OK"])
})

export { routeSignout }
