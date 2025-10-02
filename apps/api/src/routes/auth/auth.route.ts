import { Hono } from "hono"
import { routeSigninCredential } from "./signin-credential.route"
import { routeSignout } from "./signout.route"
import { routeSignupCredential } from "./signup-credential.route"
import { routeVerify } from "./verify.route"

const routeAuth = new Hono()

routeAuth.route("/signin/credential", routeSigninCredential)
routeAuth.route("/signup/credential", routeSignupCredential)
routeAuth.route("/signout", routeSignout)
routeAuth.route("/verify", routeVerify)

export { routeAuth }
