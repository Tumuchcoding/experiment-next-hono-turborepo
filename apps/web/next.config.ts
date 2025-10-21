import type { NextConfig } from "next";
import { env } from "@/config/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        destination: `${env.apiProxyTarget}/:path*`,
        source: "/api/:path*",
      },
    ];
  },
  typedRoutes: true,
};

export default nextConfig;
