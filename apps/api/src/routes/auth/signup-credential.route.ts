import { hash } from "argon2"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { db } from "../../utils/db/db.utils"
import { ACCOUNT, PROFILE, USER } from "../../utils/db/schema/user.schema"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { setSession, signSession } from "../../utils/session.util"

const routeSignupCredential = new Hono()

routeSignupCredential.post("/", async (context) => {
  try {
    const { email, name, password } = await context.req.json()

    // Check if user with this email already exists
    const [existingUser] = await db
      .select()
      .from(USER)
      .where(eq(USER.email, email))
      .limit(1)

    if (existingUser) {
      return context.json({}, HTTP_STATUS_CODE["409_CONFLICT"])
    }

    const hashedPassword = await hash(password)

    await db.transaction(async (transaction) => {
      // Create new user
      const [newUser] = await transaction
        .insert(USER)
        .values({ email, name })
        .returning()

      // Create account for the user
      const account = transaction.insert(ACCOUNT).values({
        password: hashedPassword,
        userId: newUser.id,
      })

      // Create profile for the user
      const profile = transaction.insert(PROFILE).values({
        userId: newUser.id,
      })

      await Promise.all([account, profile])

      const session = await signSession({
        email,
        id: newUser.id,
        name,
      })
      setSession(context, session)
    })

    return context.json({}, HTTP_STATUS_CODE["201_CREATED"])
  } catch (error) {
    console.error(error)
    return context.json({}, HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"])
  }
})

export { routeSignupCredential }
