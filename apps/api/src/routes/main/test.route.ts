import { Hono } from "hono"

const routeTest = new Hono()

routeTest.get("/", async (context) => {
  return context.json({ data: "Hello Hono!" })
})

export { routeTest }
