import { Hono } from "hono"
import { cors } from 'hono/cors'
import { loggerMiddleware } from "./middleware/logger.middleware"
import { routeAuth } from "./routes/auth/auth.route"
import { routeMain } from "./routes/main/main.route"

export const isDevelopment = process.env.NODE_ENV === "development"

const app = new Hono()

if (isDevelopment) {
  // Custom logger: show only the completed response line
  app.use(loggerMiddleware())
}
// eslint-disable-next-line unicorn/prefer-set-has
const ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'https://experiment-next-hono-turborepo-web-ivory.vercel.app/',
]

// CORS for all routes
app.use('*', cors({
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, 
  exposeHeaders: ['Content-Length'],
  maxAge: 86_400,
  origin: (origin) => (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ''),
}))

app.route("/", routeMain)
app.route("/auth", routeAuth)

export default {
  fetch: app.fetch,
  port: 3002,
}
