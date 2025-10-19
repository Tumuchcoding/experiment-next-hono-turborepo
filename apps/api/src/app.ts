import "reflect-metadata"
import { implement, ORPCHono } from "@outscope/orpc-hono"
import { RPCHandler } from "@orpc/server/fetch"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { contract, type AppContext } from "@/orpc/contract"
import { AppController } from "@/orpc/controllers/app.controller"
import { AuthController } from "@/orpc/controllers/auth.controller"

const app = new Hono()

const getEnv = (key: string): string | undefined => {
  const valueFromBun = typeof Bun !== "undefined" ? Bun.env[key] : undefined
  if (valueFromBun !== undefined) return valueFromBun

  const nodeEnv =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env ?? undefined

  return nodeEnv?.[key]
}

const allowedOrigins = (getEnv("API_ALLOWED_ORIGINS") ?? "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const defaultOrigin = allowedOrigins[0] ?? "http://localhost:3001"

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return defaultOrigin
      return allowedOrigins.includes(origin) ? origin : defaultOrigin
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

const orpcHono = new ORPCHono({
  contract,
  producer: implement(contract).$context<AppContext>(),
})

const router = await orpcHono.applyMiddleware(app, {
  controllers: [new AuthController(), new AppController()],
})

const rpcHandler = new RPCHandler(router)

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context: { honoContext: c },
    prefix: "/rpc",
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  return next()
})

export default {
  fetch: app.fetch,
  port: 3002,
}
