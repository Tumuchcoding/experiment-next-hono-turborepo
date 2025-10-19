import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const entryPath = path.join(distDir, "app.js");
const handlerPath = path.join(distDir, "vercel-handler.js");

if (!fs.existsSync(entryPath)) {
  console.error(
    "[generate-vercel-handler] Expected dist/app.js to exist before creating the Vercel handler.",
  );
  process.exit(1);
}

const handlerSource = `import app from "./app.js";

export const config = {
  runtime: "nodejs20.x",
};

function toHeadersObject(nodeHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (typeof value === "string") {
      headers.append(key, value);
    }
  }
  return headers;
}

async function toNodeBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk),
    );
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (!app || typeof app.fetch !== "function") {
    throw new Error("dist/app.js must export default { fetch } for Vercel deployment.");
  }

  const origin = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const protocol =
    req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http");
  const url = new URL(req.url ?? "/", \`\${protocol}://\${origin}\`);

  const headers = toHeadersObject(req.headers);
  const body = await toNodeBody(req);

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const response = await app.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
`;

fs.writeFileSync(handlerPath, handlerSource, "utf8");
console.info(
  "[generate-vercel-handler] Wrote dist/vercel-handler.js for @vercel/node runtime.",
);
