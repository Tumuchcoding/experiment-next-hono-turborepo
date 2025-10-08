import { Hono } from "hono"

const routeRoot = new Hono().get("/", async (context) => {
  return context.text("Hello Hono!")
})

export { routeRoot }
