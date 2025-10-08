/* eslint-disable @typescript-eslint/no-unused-vars */
import {  type Context, Hono } from "hono"
import { cors } from "hono/cors"
import { loggerMiddleware } from "./middleware/logger.middleware.js"
import { routeAuth } from "./routes/auth/auth.route.js"
import { routeMain } from "./routes/main/main.route.js"

export const isDevelopment = process.env.NODE_ENV === "development"
const WEB_ORIGIN = process.env.NEXT_PUBLIC_WEB_URL ?? process.env.WEB_ORIGIN ?? ""
// Optional comma-separated allowlist for prod, e.g. "https://a.com,https://b.com"
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? []
const app =  new Hono()

if (isDevelopment) {
  // Custom logger: show only the completed response line
  app.use(loggerMiddleware())
}

/** dev: allow common localhost ports; prod: strict allowlist */
const devOrigin = (origin: string, _c: Context): null | string | undefined => {
  // Allow non-browser callers (no Origin header) and common local dev ports
  const ok =
    !origin ||
    /^http:\/\/(localhost|127\.0\.0\.1):(?:3000|3001|5173|5174|8080)$/.test(origin)
  // If allowed, reflect the origin; if no origin, return "*" (not a browser CORS flow)
  // eslint-disable-next-line unicorn/no-null
  return ok ? (origin || "*") : null
}

const prodAllowed = new Set<string>([
  WEB_ORIGIN,
  ...CORS_ORIGINS,
].filter(Boolean))

const prodOrigin = (origin: string, _c: Context): null | string | undefined => {
  // Only reflect exact matches from the allowlist
  // eslint-disable-next-line unicorn/no-null
  return origin && prodAllowed.has(origin) ? origin : null
}

app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,          // needed if you’re sending cookies
    maxAge: 86_400,
    origin: isDevelopment ? devOrigin : prodOrigin,
    // exposeHeaders: ["Content-Length"], // optional
  }),
)

const routes = app.route("/", routeMain).route("/auth", routeAuth)



export default {
  fetch: app.fetch,
  port: 3002,
}
export type AppType = typeof routes
