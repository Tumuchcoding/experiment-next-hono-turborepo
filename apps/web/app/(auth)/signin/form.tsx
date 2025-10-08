/* eslint-disable unicorn/no-null */
"use client"

import { Button } from "@nattui/react-components"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { api } from "@/utils/api-client"

export default function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  function getStr(fd: FormData, key: string): string {
    const v = fd.get(key)
    return typeof v === "string" ? v : ""
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const fd = new FormData(event.currentTarget)
    const email = getStr(fd, "email")
    const password = getStr(fd, "password")

    try {
      // Typed from your server's SignInBody and EmptyOk
      const res = await api["auth"]["signin-credential"].$post({
        json: { email, password },
      })
      if (!res.ok) {
        // Try to read a typed error body if present
        let message = "Failed to sign in."
        try {
          const data = (await res.json()) as { error?: string }
          if (data?.error) message = data.error
        } catch {}
        throw new Error(message)
      }

      // refresh data that depends on auth
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error_: any) {
      setError(error_?.message ?? "Failed to sign in.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex max-w-240 flex-col" onSubmit={onSubmit}>
      <label className="mb-2 inline-block w-fit text-14" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="border-amber-100 mb-16 h-36 border border-solid px-4"
        defaultValue="test@test.com"
        disabled={isLoading}
        id="email"
        name="email"
        required
        type="email"
      />

      <label className="mb-2 inline-block w-fit text-14" htmlFor="password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className="border-amber-100 mb-8 h-36 border border-solid px-4"
        defaultValue="123123"
        disabled={isLoading}
        id="password"
        name="password"
        required
        type="password"
      />

      {error ? (
        <p className="text-red-600 mb-8 text-12" role="alert">
          {error}
        </p>
      ) : null}

      <Button isDisabled={isLoading} isLoading={isLoading} type="submit">
        Sign in
      </Button>
    </form>
  )
}
