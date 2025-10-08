// api/routes/auth/signup-credential.route.ts
import { zValidator } from "@hono/zod-validator"
import { hash } from "argon2"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { db } from "../../utils/db/db.utils"
import { ACCOUNT, PROFILE, USER } from "../../utils/db/schema/user.schema"
import { jsonError, normalizeEmail } from "../../utils/http"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { setSession, signSession } from "../../utils/session.util"
import { EmptyOk, SignUpBody } from "./schemas"

export const routeSignupCredential = new Hono()
  .post(
    "/",
    zValidator("json", SignUpBody),
    async (c) => {
      try {
        const { email: rawEmail, name, password } = c.req.valid("json")
        const email = normalizeEmail(rawEmail)

        // Unique check
        const [existing] = await db.select().from(USER).where(eq(USER.email, email)).limit(1)
        if (existing) {
          return jsonError(c, HTTP_STATUS_CODE["409_CONFLICT"], "Email already in use")
        }

        const hashedPassword = await hash(password)

        await db.transaction(async (trx) => {
          const [newUser] = await trx.insert(USER).values({ email, name }).returning()

          // Ensure provider field is set to "credentials" in your schema default or here:
          const accountPromise = trx.insert(ACCOUNT).values({
            password: hashedPassword,
            provider: "credentials",
            userId: newUser.id,
          })

          const profilePromise = trx.insert(PROFILE).values({ userId: newUser.id })

          await Promise.all([accountPromise, profilePromise])

          const session = await signSession({
            email,
            id: newUser.id,
            name,
          })
          setSession(c, session)
        })

        const body: EmptyOk = { ok: true }
        return c.json(body, HTTP_STATUS_CODE["201_CREATED"])
      } catch (error) {
        console.error(error)
        // If your DB throws a unique-constraint error, you can map it to 409 here as well.
        return jsonError(c, HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"])
      }
    },
  )
