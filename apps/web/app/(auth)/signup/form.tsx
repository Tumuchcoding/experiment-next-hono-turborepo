/* eslint-disable unicorn/no-null */
"use client"

import { Button } from "@nattui/react-components"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { api } from "@/utils/api-client"

export default function SignUpForm() {
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
    const name = getStr(fd, "name")
    const email = getStr(fd, "email")
    const password = getStr(fd, "password")

    // (Optional) quick client-side check to avoid an immediate 400 from Zod
    if (password.length < 6) {
      setIsLoading(false)
      setError("Password must be at least 8 characters.")
      return
    }

    try {
      const res = await api["auth"]["signup-credential"].$post({
        json: { email, name, password }, // typed from your SignUpBody schema
      })

      if (!res.ok) {
        let message = "Failed to sign up."
        try {
          const body = (await res.json()) as { error?: string }
          if (body?.error) message = body.error
        } catch {}
        throw new Error(message)
      }

      // Signed in via server session on success -> refresh data/UI
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error_: any) {
      setError(error_?.message ?? "Failed to sign up.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex max-w-240 flex-col" onSubmit={onSubmit}>
      <label className="mb-2 inline-block w-fit text-14" htmlFor="name">
        Name
      </label>
      <input
        autoComplete="name"
        className="border-amber-100 mb-16 h-36 border border-solid px-4"
        defaultValue="Mark Scout"
        disabled={isLoading}
        id="name"
        name="name"
        required
        type="text"
      />

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
        autoComplete="new-password"
        className="border-amber-100 mb-8 h-36 border border-solid px-4"
        defaultValue="123123" // ⚠️ your server requires >= 8 chars & mixed rules
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
      // eslint-disable-next-line unicorn/no-null
      ) : null}

      <Button isDisabled={isLoading} isLoading={isLoading} type="submit">
        Sign up
      </Button>
    </form>
  )
}
