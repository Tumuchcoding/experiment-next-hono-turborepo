import "reflect-metadata";
import { RPCHandler } from "@orpc/server/fetch";
import { implement, ORPCHono } from "@outscope/orpc-hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { type AppContext, contract } from "./orpc/contract.js";
import { AppController } from "./orpc/controllers/app.controller.js";
import { AuthController } from "./orpc/controllers/auth.controller.js";

const app = new Hono();

const globalTargets = globalThis as {
  Bun?: { env?: Record<string, string | undefined> };
  process?: { env?: Record<string, string | undefined> };
};

const getEnv = (key: string): string | undefined => {
  const fromBun = globalTargets.Bun?.env?.[key];
  if (fromBun !== undefined) return fromBun;
  return globalTargets.process?.env?.[key];
};

const allowedOrigins = (
  getEnv("API_ALLOWED_ORIGINS") ?? "http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const defaultOrigin = allowedOrigins[0] ?? "http://localhost:3001";

app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: (origin: string | undefined) => {
      if (!origin) return defaultOrigin;
      return allowedOrigins.includes(origin) ? origin : defaultOrigin;
    },
  })
);

const orpcHono = new ORPCHono({
  contract,
  producer: implement(contract).$context<AppContext>(),
});

const router = await orpcHono.applyMiddleware(app, {
  controllers: [new AuthController(), new AppController()],
});

const rpcHandler = new RPCHandler(router);

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context: { honoContext: c },
    prefix: "/rpc",
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  return next();
});

export default {
  fetch: app.fetch,
  port: 3002,
};
