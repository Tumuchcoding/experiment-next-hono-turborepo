import type { AppType } from "@api/app"
import { hc } from "hono/client"
// web/src/app/test/page.tsx
import { headers } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"
const api = hc<AppType>(API_BASE)

export default async function TestPage() {
  // forward incoming cookies to the API (works for cross-origin too)
  // eslint-disable-next-line unicorn/no-await-expression-member
  const cookie = (await headers()).get("cookie") ?? ""
  const res = await api["test"].$get({
    fetch: (input: Request | string | URL, init: RequestInit | undefined) =>
      fetch(input, {
        ...init,
        cache: "no-store",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headers: { ...(init?.headers as any), cookie },
      }),
  })

  if (!res.ok) return <div>Failed to load: HTTP {res.status}</div>

  const data = await res.json() // typed as { data: string }
  return <div>{data.data}</div>
}
