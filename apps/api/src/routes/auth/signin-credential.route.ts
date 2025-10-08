import { zValidator } from "@hono/zod-validator"
// api/routes/auth/signin-credential.route.ts
import { verify } from "argon2"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { db } from "../../utils/db/db.utils"
import { ACCOUNT, USER } from "../../utils/db/schema/user.schema"
import { jsonError, normalizeEmail } from "../../utils/http"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { setSession, signSession } from "../../utils/session.util"
import { EmptyOk, SignInBody } from "./schemas"

// Optional: a precomputed harmless argon2 hash to mitigate user-enumeration timing.
// You can generate it once (argon2 of the string "invalid").
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$fV0pQXjH1Wm2nA1Kk7bq3Q$7b9f1nYF8v8mZp1H4QW2g9rpr4y2Cw5S8m2y1DBoX1U" // example

export const routeSigninCredential = new Hono()
  .post(
    "/",
    zValidator("json", SignInBody),
    async (c) => {
      try {
        const { email: rawEmail, password } = c.req.valid("json")
        const email = normalizeEmail(rawEmail)

        // Lookup
        const [existingUser] = await db
          .select({
            email: USER.email,
            hashedPassword: ACCOUNT.password,
            id: USER.id,
            name: USER.name,
          })
          .from(USER)
          .innerJoin(
            ACCOUNT,
            and(eq(ACCOUNT.userId, USER.id), eq(ACCOUNT.provider, "credentials")),
          )
          .where(eq(USER.email, email))
          .limit(1)

        // Timing mitigation: always run verify against *some* hash
        const hashed = existingUser?.hashedPassword ?? DUMMY_HASH
        const ok = await verify(hashed, password).catch(() => false)

        if (!existingUser || !ok || !existingUser.hashedPassword) {
          // Same response for "not found" and "bad password"
          return jsonError(c, HTTP_STATUS_CODE["401_UNAUTHORIZED"], "Invalid credentials")
        }

        const session = await signSession({
          email: existingUser.email,
          id: existingUser.id,
          name: existingUser.name,
        })
        setSession(c, session)

        // Typed empty-ok response
        const body: EmptyOk = { ok: true }
        // (Clients infer this shape via RPC types.)
        return c.json(body, HTTP_STATUS_CODE["200_OK"])
      } catch (error) {
        console.error(error)
        return jsonError(c, HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"])
      }
    },
  )
