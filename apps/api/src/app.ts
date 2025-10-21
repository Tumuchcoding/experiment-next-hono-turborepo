import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "@/config/env";
import { router } from "./orpc/router.js";

const app = new Hono();

const allowedOrigins = env.allowedOrigins.length
  ? env.allowedOrigins
  : ["http://localhost:3001"];

const defaultOrigin = allowedOrigins[0];

app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: (origin) => {
      if (!origin) return defaultOrigin;
      return allowedOrigins.includes(origin) ? origin : defaultOrigin;
    },
  })
);

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
