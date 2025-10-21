import type { NextConfig } from "next";

const apiProxyTarget = (
  process.env.API_PROXY_TARGET ?? "http://localhost:3002"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        destination: `${apiProxyTarget}/:path*`,
        source: "/api/:path*",
      },
    ];
  },
  typedRoutes: true,
};

export default nextConfig;
