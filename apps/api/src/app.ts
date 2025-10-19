import "reflect-metadata"
import { implement, ORPCHono } from "@outscope/orpc-hono"
import { RPCHandler } from "@orpc/server/fetch"
import { Hono } from "hono"
import { contract, type AppContext } from "@/orpc/contract"
import { AppController } from "@/orpc/controllers/app.controller"
import { AuthController } from "@/orpc/controllers/auth.controller"

const app = new Hono()

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
