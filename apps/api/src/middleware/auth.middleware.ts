import type { MiddlewareHandler } from "hono"
import { HTTP_STATUS_CODE } from "../utils/http-status-code.js"
import { getSession, verifySession } from "../utils/session.util.js"

export const verifyMiddleware: MiddlewareHandler = async (c, next) => {
  const session = getSession(c)

  if (!session) {
    return c.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
  }

  try {
    await verifySession(session)
    // Important: return next() so the return type is consistent
    return next()
  } catch {
    return c.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
  }
}