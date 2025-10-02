"server-only"

import { cookies as getCookies } from "next/headers"
import { cache } from "react"
import { API } from "@/utils/url"

async function uncachedGetIsAuthenticated(): Promise<boolean> {
  try {
    const cookies = await getCookies()
    const response = await fetch(API.AUTH.VERIFY, {
      cache: "no-store",
      headers: {
        Cookie: cookies.toString(),
      },
    })
    if (!response.ok) return false
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const getIsAuthenticated = cache(uncachedGetIsAuthenticated)
