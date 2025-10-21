import { oc } from "@orpc/contract"
import type { Context } from "hono"
import { z } from "zod"

export interface AppContext {
  honoContext: Context
}

export const OPENAPI_INTERNAL_TAG = "Internal"

export const schemaUserIdParam = z.object({
  userId: z
    .coerce
    .number()
    .int()
    .positive()
    .describe("Numeric user identifier"),
});

export const schemaAuthSignupCredential = z.object({
  email: z.string().email().describe("User email address"),
  name: z
    .string()
    .min(1)
    .describe("Full name shown on the account"),
  password: z
    .string()
    .min(6)
    .describe("Password with at least six characters"),
}).describe("Credentials used to create a new account")

export const schemaAuthSigninCredential = z.object({
  email: z.string().email().describe("Registered email address"),
  password: z.string().min(6).describe("Account password"),
}).describe("Credentials used to sign in with email and password")

export const schemaAuthVerify = z.object({
  session: z.string().describe("Session token to validate"),
}).describe("Session verification payload")

const sessionResponseSchema = z.object({
  success: z.boolean().describe("Whether the operation succeeded"),
}).describe("Basic success response")

export const userSchema = z.object({
  createdAt: z.string().describe("ISO timestamp of creation"),
  email: z.string().email().describe("User email address"),
  emailVerified: z.boolean().describe("Whether the email address was verified"),
  id: z.number().describe("Unique user identifier"),
  name: z.string().describe("Full name displayed for the user"),
  role: z.enum(["admin", "user"]).describe("Assigned role within the system"),
  updatedAt: z.string().describe("ISO timestamp of last update"),
}).describe("User record returned from the API")

export const contract = {
  authSigninCredential: oc
    .route({
      method: "POST",
      path: "/auth/signin/credential",
      summary: "Sign in with email and password",
      tags: ["Auth"],
    })
    .input(schemaAuthSigninCredential)
    .output(sessionResponseSchema),
  authSignoutCredential: oc
    .route({
      method: "POST",
      path: "/auth/signout",
      summary: "Sign out current user",
      tags: ["Auth"],
    })
    .output(sessionResponseSchema),
  authSignupCredential: oc
    .route({
      method: "POST",
      path: "/auth/signup/credential",
      summary: "Sign up with email and password",
      tags: ["Auth"],
    })
    .input(schemaAuthSignupCredential)
    .output(sessionResponseSchema),
  authVerify: oc
    .route({
      method: "POST",
      path: "/auth/verify",
      summary: "Verify session token",
      tags: ["Auth", OPENAPI_INTERNAL_TAG],
    })
    .input(schemaAuthVerify)
    .output(z.boolean()),
  test: oc
    .route({
      method: "GET",
      path: "/test",
      summary: "Healthcheck",
      tags: ["System", OPENAPI_INTERNAL_TAG],
    })
    .output(z.string()),
  users: oc
    .route({
      method: "GET",
      path: "/users",
      summary: "List users",
      tags: ["Users"],
    })
    .output(z.array(userSchema)),
  userById: oc
    .route({
      method: "GET",
      path: "/users/{userId}",
      summary: "Get a user by id",
      tags: ["Users"],
      inputStructure: "detailed",
    })
    .input(
      z
        .object({
          params: schemaUserIdParam,
        })
        .describe("Route params used to locate the user")
    )
    .output(userSchema),
}

export type AppContract = typeof contract
