"use client"

import { useEffect, useState } from "react"
import { API } from "@/utils/url"

interface User {
  createdAt: string
  email: string
  emailVerified: boolean
  id: string
  name: string
  role: string
  updatedAt: string
}

export function Users() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch(API.USERS)
      .then((response) => response.json())
      .then((data) => setUsers(data.users))
  }, [])

  return (
    <div className="flex flex-col gap-y-16">
      {users.map((user) => (
        <div className="flex flex-col font-mono" key={user.id}>
          <p className="text-14">id: {user.id}</p>
          <p className="text-14">name: {user.name}</p>
          <p className="text-14">email: {user.email}</p>
          <p className="text-14">emailVerified: {user.emailVerified}</p>
          <p className="text-14">role: {user.role}</p>
          <p className="text-14">createdAt: {user.createdAt}</p>
          <p className="text-14">updatedAt: {user.updatedAt}</p>
        </div>
      ))}
    </div>
  )
}
