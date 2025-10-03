import type { NextConfig } from "next"

// const API_URL = process.env.NEXT_PUBLIC_API_URL
const isProd = process.env.NODE_ENV === 'production';
//change to your deployed api url
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (isProd ? 'https://experiment-next-hono-turborepo-api-three.vercel.app/' : 'http://localhost:3002');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        destination: `${API_URL}/:path*`,
        source: "/api/:path*",
      },
    ]
  },
  typedRoutes: true,
}

export default nextConfig
