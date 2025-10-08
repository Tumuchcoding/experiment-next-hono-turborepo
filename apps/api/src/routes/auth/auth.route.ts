import { Hono } from "hono"
import { routeSigninCredential } from "./signin-credential.route.js"
import { routeSignout } from "./signout.route.js"
import { routeSignupCredential } from "./signup-credential.route.js"
import { routeVerify } from "./verify.route.js"

const routeAuth = new Hono()

.route("/signin-credential", routeSigninCredential)
.route("/signup-credential", routeSignupCredential)
.route("/signout", routeSignout)
.route("/verify", routeVerify)

export { routeAuth }
