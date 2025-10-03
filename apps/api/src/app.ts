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
// const ALLOWED_ORIGINS = [
//   'http://localhost:3001',
//   'https://experiment-next-hono-turborepo-web-ivory.vercel.app/',
//   'https://experiment-next-hono-turborepo-web.vercel.app/api/users',
//   'https://experiment-next-hono-turborepo-web.vercel.app/api/auth/signin/credential']

// Allow localhost + your prod domains (incl. vercel.app if you deploy there)
const allowOrigin = (origin?: string) => {
  if (!origin) return '' // non-browser
  try {
    const { host, protocol } = new URL(origin)
    if (
      host === 'localhost:3001' ||
      host.endsWith('.vercel.app')
      // ||          // <-- keep if you use Vercel preview/prod
      // host.endsWith('your-frontend.com')       // <-- your custom domain
    ) {
      // echo back the caller exactly (required when using credentials)
      return `${protocol}//${host}`
    }
  } catch { /* empty */ }
  return ''
}
// CORS for all routes (must be before app.route(...))
app.use(
  '*',
  cors({
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,     // set to true only if you actually use cookies/HTTP auth in the browser
    exposeHeaders: ['Content-Length'],
    maxAge: 86_400,
    origin: (o) => allowOrigin(o),
  })
)

// Handle stray preflights (e.g., wrong path -> 404) so they still get CORS headers
app.options('*', (c) => {
  const origin = c.req.header('Origin') || ''
  const allowed = allowOrigin(origin) === origin
  return new Response(undefined, {
    headers: allowed
      ? {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers':
            c.req.header('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Origin': origin,
          'Vary': 'Origin',
        }
      : {},
    status: 204,
  })
})

// Ensure CORS on 404/500 too
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addCors = (c: any, res: Response) => {
  const origin = c.req.header('Origin') || ''
  if (allowOrigin(origin) === origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.append('Vary', 'Origin')
  }
  return res
}
app.onError((err, c) => addCors(c, c.json({ error: 'Internal Server Error' }, 500)))
app.notFound((c) => addCors(c, c.json({ error: 'Not Found' }, 404)))

// Your routes
app.route('/', routeMain)
app.route('/auth', routeAuth)

export default {
  fetch: app.fetch,
  port: 3002,
}

