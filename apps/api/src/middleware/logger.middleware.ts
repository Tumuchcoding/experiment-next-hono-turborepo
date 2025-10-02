import type { MiddlewareHandler } from "hono/types"
import { logger } from "hono/logger"

export function loggerMiddleware(): MiddlewareHandler {
  return logger((str, ...rest) => {
    if (str.startsWith("-->")) {
      console.log(str.replace(/^-->\s*/, ""), ...rest)
    }
  })
}
