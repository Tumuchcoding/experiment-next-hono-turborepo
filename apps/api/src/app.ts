import { OpenAPIGenerator, type OpenAPI } from "@orpc/openapi";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Scalar, type ApiReferenceConfiguration } from "@scalar/hono-api-reference";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { env } from "./config/env.js";
import { OPENAPI_INTERNAL_TAG, contract } from "./orpc/contract.js";
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

const openApiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});
let openApiDocument: OpenAPI.Document | null = null;
const normalizedBaseUrl = env.apiBaseUrl.replace(/\/$/, "");
const rpcServerUrl = `${normalizedBaseUrl}/rpc`;
const openApiServerUrl = `${normalizedBaseUrl}/openapi`;
const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

type HttpMethodKey = Extract<(typeof HTTP_METHODS)[number], keyof OpenAPI.PathItemObject>;

const isHttpMethod = (value: string): value is HttpMethodKey =>
  (HTTP_METHODS as readonly string[]).includes(value);

const operationExamples: Partial<
  Record<string, Partial<Record<HttpMethodKey, unknown>>>
> = {
  "/auth/signin/credential": {
    post: {
      email: "demo@example.com",
      password: "password123",
    },
  },
  "/auth/signup/credential": {
    post: {
      email: "demo@example.com",
      name: "Demo User",
      password: "password123",
    },
  },
};

const sanitizeOpenApiDocument = (doc: OpenAPI.Document) => {
  if (!doc.paths) return doc;

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (!pathItem) continue;

    let hasExternalOperations = false;

    for (const key of Object.keys(pathItem)) {
      if (!isHttpMethod(key)) continue;

      const method = key as HttpMethodKey;
      const candidate = pathItem[method];
      if (!candidate || typeof candidate === "string") continue;

      const operation = candidate as OpenAPI.OperationObject;
      const tags = Array.isArray(operation.tags) ? operation.tags : [];

      if (tags.includes(OPENAPI_INTERNAL_TAG)) {
        delete pathItem[method];
        continue;
      }

      hasExternalOperations = true;
    }

    if (!hasExternalOperations) {
      delete doc.paths[path];
    }
  }

  if (Array.isArray(doc.tags)) {
    doc.tags = doc.tags.filter((tag) => tag.name !== OPENAPI_INTERNAL_TAG);
  }

  return doc;
};

const applyOperationExamples = (doc: OpenAPI.Document) => {
  if (!doc.paths) return doc;

  for (const [path, methods] of Object.entries(operationExamples)) {
    if (!methods) continue;
    const pathItem = doc.paths[path];
    if (!pathItem) continue;

    for (const [methodKey, example] of Object.entries(methods)) {
      if (!isHttpMethod(methodKey) || example === undefined) continue;

      const method = methodKey as HttpMethodKey;
      const operationCandidate = pathItem[method];
      if (!operationCandidate || typeof operationCandidate === "string") continue;

      const operation = operationCandidate as OpenAPI.OperationObject;
      const requestBody = operation.requestBody;
      if (!requestBody || typeof requestBody === "string" || "$ref" in requestBody) {
        continue;
      }

      const jsonContent = requestBody.content?.["application/json"];
      if (!jsonContent) continue;

      if (jsonContent.example === undefined && jsonContent.examples === undefined) {
        jsonContent.example = example;
      }
    }
  }

  return doc;
};

const openApiHttpHandler = new OpenAPIHandler(router, {
  filter: ({ contract }) => {
    const tags = contract?.["~orpc"]?.route?.tags;
    return !Array.isArray(tags) || !tags.includes(OPENAPI_INTERNAL_TAG);
  },
});

const getOpenApiDocument = async () => {
  if (!openApiDocument) {
    const document = await openApiGenerator.generate(contract, {
      info: {
        title: "Experiment API",
        version: "1.0.0",
        description: "OpenAPI specification generated from the oRPC contract",
      },
      servers: [
        { url: openApiServerUrl, description: "REST bridge" },
        { url: rpcServerUrl, description: "oRPC transport" },
      ],
    });

    openApiDocument = applyOperationExamples(sanitizeOpenApiDocument(document));
  }

  return openApiDocument;
};

app.get("/openapi.json", async (c) => c.json(await getOpenApiDocument()));
app.get(
  "/docs",
  Scalar(() => ({
    spec: {
      url: "/openapi.json",
    },
    layout: "modern",
    hideDownloadButton: true,
    meta: {
      title: "Experiment API Reference",
    },
  }) as Partial<ApiReferenceConfiguration>)
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

app.use("/openapi/*", async (c, next) => {
  const { matched, response } = await openApiHttpHandler.handle(c.req.raw, {
    context: { honoContext: c },
    prefix: "/openapi",
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
