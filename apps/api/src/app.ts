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
// Allow your preview & prod origins (add others you actually use)
const allowOrigin = (origin?: string) => {
  if (!origin) return '' // non-browser clients
  try {
    const url = new URL(origin)
    const allowedHosts = new Set([
      'experiment-next-hono-turborepo-web-ivory.vercel.app', // your frontend
      'localhost:3000',
      // add your prod/custom domain(s) here
    ])

    // Option A: lock to specific hosts
    if (allowedHosts.has(url.host)) return origin

    // Option B (optional): allow all vercel.app previews for this project/org
    if (url.host.endsWith('.vercel.app')) return origin

  } catch { /* empty */ }
  return ''
}

// 👉 CORS must be registered before any routes
app.use(
  '*',
  cors({
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // set true only if you need cookies/HTTP auth in the browser
    exposeHeaders: ['Content-Length'],
    maxAge: 86_400,
    origin: (o) => allowOrigin(o),
  })
)

// (optional) ensure preflights/404/500 also carry CORS
// app.options('*', (c) => c.text('', 204))
app.onError((err, c) => c.json({ error: 'Internal Server Error' }, 500))
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// your routes
app.route('/', routeMain)
app.route('/auth', routeAuth)

export default { fetch: app.fetch, port: 3002 }