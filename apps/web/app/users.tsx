/* eslint-disable unicorn/no-null */
// web/src/components/Users.tsx
"use client"

import { useEffect, useState } from "react"
import { api } from "@/utils/api-client"

type UsersPayload = Awaited<ReturnType<typeof fetchUsersOnce>>

export function Users() {
  const [data, setData] = useState<null | UsersPayload>(null)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    fetchUsersOnce().then(setData).catch((error_) => setError(String(error_)))
  }, [])

  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return <div>Loading…</div>
const users = 'users' in data ? data.users : [];

  return (
    <div className="flex flex-col gap-y-6">
      {users.map((u) => (
        <div className="flex flex-col font-mono" key={u.id}>
          <p>id: {u.id}</p>
          <p>name: {u.name}</p>
          <p>email: {u.email}</p>
          <p>createdAt: {u.createdAt}</p>
        </div>
      ))}
    </div>
  )
}

async function fetchUsersOnce() {
  const res = await api["users"].$get({ query: { limit: "20" } })
  if (!res.ok) throw new Error("Failed to load users")
  return res.json() // -> { users: [...], nextCursor: string | null }
}
