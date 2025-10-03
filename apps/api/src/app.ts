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
  'https://experiment-next-hono-turborepo-web.vercel.app/api/users',
  'https://experiment-next-hono-turborepo-web.vercel.app/api/auth/signin/credential']

// CORS for all routes
app.use(
  '*',
  cors({
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,        // set true only if you use cookies/HTTP auth from the browser
    exposeHeaders: ['Content-Length'],
    maxAge: 86_400,
    // echo back the caller's Origin only if it's allowed
    origin: (origin) => (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ''),
  })
)

// your routes
app.route('/', routeMain)
app.route('/auth', routeAuth)

export default {
  fetch: app.fetch,
  port: 3002,
}
