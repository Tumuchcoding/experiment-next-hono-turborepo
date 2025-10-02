import type { Context, Next } from "hono"
import { HTTP_STATUS_CODE } from "../utils/http-status-code"
import { getSession, verifySession } from "../utils/session.util"

export async function verifyMiddleware(context: Context, next: Next) {
  try {
    const session = getSession(context)

    if (!session) {
      return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
    }

    await verifySession(session)

    await next()
  } catch {
    return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
  }
}
