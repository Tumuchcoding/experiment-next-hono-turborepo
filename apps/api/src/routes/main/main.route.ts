import { Hono } from "hono"
import { routeRoot } from "./root.route"
import { routeTest } from "./test.route"
import { routeUsers } from "./users.route"

const routeMain = new Hono()

routeMain.route("/", routeRoot)
routeMain.route("/users", routeUsers)
routeMain.route("/test", routeTest)

export { routeMain }
