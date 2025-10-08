import { Hono } from "hono"
import { routeSigninCredential } from "./signin-credential.route"
import { routeSignout } from "./signout.route"
import { routeSignupCredential } from "./signup-credential.route"
import { routeVerify } from "./verify.route"

const routeAuth = new Hono()

.route("/signin-credential", routeSigninCredential)
.route("/signup-credential", routeSignupCredential)
.route("/signout", routeSignout)
.route("/verify", routeVerify)

export { routeAuth }
