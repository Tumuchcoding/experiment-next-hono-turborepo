import { Hono } from "hono"
import { routeRoot } from "./root.route"
import { routeTest } from "./test.route"
import { routeUsers } from "./users.route"

const routeMain = new Hono()
.route("/", routeRoot)
.route("/users", routeUsers)
.route("/test", routeTest)

export { routeMain }
