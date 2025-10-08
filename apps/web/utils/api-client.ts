import type { AppType } from "@api/app" // from the API package
import { hc } from "hono/client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"


export const api = hc<AppType>(API_BASE, {
  fetch: (input: Request | string | URL, init: RequestInit | undefined) => fetch(input, { ...init, credentials: "include" }),
})

