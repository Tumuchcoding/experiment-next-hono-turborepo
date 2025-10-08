import { Hono } from "hono"

// const routeTest = new Hono()

export const routeTest = new Hono().get("/", (c) => c.json({ data: "Hello Hono!" } as const))

// export { routeTest }
