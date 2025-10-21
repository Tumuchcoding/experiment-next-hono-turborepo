import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { router } from "./orpc/router.js";

const app = new Hono();

const allowedOrigins = (
  process.env.API_ALLOWED_ORIGINS ?? "http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigin = allowedOrigins[0] ?? "http://localhost:3001";

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
