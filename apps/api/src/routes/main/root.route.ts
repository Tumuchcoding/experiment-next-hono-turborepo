import { Hono } from "hono"

const routeRoot = new Hono()

routeRoot.get("/", async (context) => {
  return context.text("Hello Hono!")
})

export { routeRoot }
