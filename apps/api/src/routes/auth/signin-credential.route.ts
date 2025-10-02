import { verify } from "argon2"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { db } from "../../utils/db/db.utils"
import { ACCOUNT, USER } from "../../utils/db/schema/user.schema"
import { HTTP_STATUS_CODE } from "../../utils/http-status-code"
import { setSession, signSession } from "../../utils/session.util"

const routeSigninCredential = new Hono()

routeSigninCredential.post("/", async (context) => {
  try {
    const { email, password } = await context.req.json()

    // Check if user with this email exists
    const [existingUser] = await db
      .select({
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

    if (!existingUser) {
      return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
    }

    const hashedPassword = existingUser.hashedPassword ?? ""
    const isPasswordCorrect = await verify(hashedPassword, password)

    if (!isPasswordCorrect) {
      return context.json({}, HTTP_STATUS_CODE["401_UNAUTHORIZED"])
    }

    const session = await signSession({
      email,
      id: existingUser.id,
      name: existingUser.name,
    })
    setSession(context, session)
    return context.json({}, HTTP_STATUS_CODE["200_OK"])
  } catch (error) {
    console.error(error)
    return context.json({}, HTTP_STATUS_CODE["500_INTERNAL_SERVER_ERROR"])
  }
})

export { routeSigninCredential }
