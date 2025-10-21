import { OpenAPIGenerator, type OpenAPI } from "@orpc/openapi";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { env } from "./config/env.js";
import { contract } from "./orpc/contract.js";
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

const openApiGenerator = new OpenAPIGenerator();
let openApiDocument: OpenAPI.Document | null = null;
const rpcServerUrl = `${env.apiBaseUrl.replace(/\/$/, "")}/rpc`;

const getOpenApiDocument = async () => {
  if (!openApiDocument) {
    openApiDocument = await openApiGenerator.generate(contract, {
      info: {
        title: "Experiment API",
        version: "1.0.0",
        description: "OpenAPI specification generated from the oRPC contract",
      },
      servers: [{ url: rpcServerUrl }],
    });
  }

  return openApiDocument;
};

app.get("/openapi.json", async (c) => c.json(await getOpenApiDocument()));
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
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
