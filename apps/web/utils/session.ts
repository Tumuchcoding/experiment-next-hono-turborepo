// "server-only"

import type { AppType } from "@api/app"
import { hc } from "hono/client"
import { cookies } from "next/headers"
import { cache } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"

async function makeServerApi() {
  // eslint-disable-next-line unicorn/no-await-expression-member
  const cookie = (await cookies()).toString() // 👈 await here
  return hc<AppType>(API_BASE, {
    fetch: (input: Request | string | URL, init: RequestInit | undefined) =>
      fetch(input, {
        ...init,
        cache: "no-store",
        headers: {
          ...(init?.headers as Record<string, string> | undefined),
          cookie,
        },
      }),
  })
}

async function uncachedGetIsAuthenticated(): Promise<boolean> {
  try {
    const api = await makeServerApi()
    const res = await api["auth"].verify.$get()
    return res.ok
  } catch (error) {
    console.error(error)
    return false
  }
}

export const getIsAuthenticated = cache(uncachedGetIsAuthenticated)
