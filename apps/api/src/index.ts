// import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { setCookie } from "hono/cookie"
import { sign } from "hono/jwt"

export const EXPIRATION_TIME_IN_SECONDS = 31_536_000 // 1 year

export const isDevelopment = process.env.NODE_ENV === "development"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.get("/test", (c) => {
  return c.json({ data: "Hello Hono!" })
})

app.get("/auth", async (c) => {
  const token = await sign({}, "PRIVATE_KEY")
  setCookie(c, "session", token, {
    httpOnly: true,
    maxAge: EXPIRATION_TIME_IN_SECONDS,
    path: "/",
    priority: "medium",
    sameSite: "lax",
    secure: !isDevelopment,
  })
  return c.json({ ok: true })
})

app.get("/auth/signin", async (c) => {
  const token = await sign({}, "PRIVATE_KEY")
  setCookie(c, "session", token, {
    httpOnly: true,
    maxAge: EXPIRATION_TIME_IN_SECONDS,
    path: "/",
    priority: "medium",
    sameSite: "lax",
    secure: !isDevelopment,
  })
  return c.json({ ok: true })
})

// serve(
//   {
//     fetch: app.fetch,
//     port: 3002,
//   },
//   (info) => {
//     console.log(`Server is running on http://localhost:${info.port}`)
//   },
// )

// import { Hono } from "hono"

// const app = new Hono()

// const welcomeStrings = [
//   "Hello Hono!",
//   "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/hono",
// ]

// app.get("/", (c) => {
//   return c.text(welcomeStrings.join("\n\n"))
// })

export default app
