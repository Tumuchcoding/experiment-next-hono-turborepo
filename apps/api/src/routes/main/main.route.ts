import { Hono } from "hono"
import { routeRoot } from "./root.route.js"
import { routeTest } from "./test.route.js"
import { routeUsers } from "./users.route.js"

const routeMain = new Hono()
.route("/", routeRoot)
.route("/users", routeUsers)
.route("/test", routeTest)

export { routeMain }
