/* eslint-disable unicorn/no-null */

import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { db } from "../../utils/db/db.utils"
import { USER } from "../../utils/db/schema/user.schema"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"

// Example: narrow what the client will “see” back:
const UserDTO = z.object({
  createdAt: z.string(), // ISO
  email: z.string().email(),
  id: z.string(),
  name: z.string().nullable(),
})

// Query params for pagination
const UsersQuery = z.object({
  cursor: z.string().optional(), // e.g., id or createdAt for cursor-based pagination
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const UsersResponse = z.object({
  nextCursor: z.string().nullable(),
  users: z.array(UserDTO),
})

export type UsersResponse = z.infer<typeof UsersResponse>

const routeUsers =  new Hono()
  // GET /users?limit&cursor — fully typed on the client via RPC
  .get(
    "/",
    zValidator("query", UsersQuery),
    async (c) => {
      try {
        const { cursor, limit } = c.req.valid("query")

        // Replace with your real query. Example pattern:
        // - If you use Drizzle: add where(gt(USER.createdAt, new Date(cursor))) etc.
        // - Here we just read all and slice for demo purposes.
        const rows = await db.select().from(USER)

        const startIndex = cursor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? rows.findIndex((r: any) => r.id === cursor) + 1
          : 0

        const slice = rows.slice(startIndex, startIndex + limit)

        // Map DB row -> DTO shape
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const users = slice.map((u: any) => ({
          createdAt: new Date(u.createdAt).toISOString(),
          email: String(u.email),
          id: String(u.id),
          name: u.name ?? null,
        }))

        const next = rows[startIndex + limit]?.id ?? null

        const payload: UsersResponse = {
          nextCursor: next ? String(next) : null,
          users,
        }

        // This response shape is what the client will infer!
        return c.json(payload, 200)
      } catch {
        return c.json(
          { error: "Internal Server Error" },
          HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"],
        )
      }
    },
  )

  export { routeUsers }
