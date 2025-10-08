import type { Context, Next } from "hono"
import { HTTP_STATUS_CODE } from "../utils/http-status-code.js"
import { getSession, verifySession } from "../utils/session.util.js"

export async function verifyMiddleware(
  context: Context,
  next: Next
): Promise<Response | void> {
  const session = getSession(context)

  if (!session) {
    return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
  }

  try {
    await verifySession(session)
    return next()
  } catch {
    return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
  }
}
