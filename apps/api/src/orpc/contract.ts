import { oc } from "@orpc/contract"
import type { Context } from "hono"
import { z } from "zod"

export interface AppContext {
  honoContext: Context
}

export const schemaAuthSignupCredential = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
})

export const schemaAuthSigninCredential = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const schemaAuthVerify = z.object({
  session: z.string(),
})

const sessionResponseSchema = z.object({
  success: z.boolean(),
})

export const userSchema = z.object({
  createdAt: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  id: z.number(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
  updatedAt: z.string(),
})

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
      tags: ["Auth"],
    })
    .input(schemaAuthVerify)
    .output(z.boolean()),
  test: oc
    .route({
      method: "GET",
      path: "/test",
      summary: "Healthcheck",
      tags: ["System"],
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
}

export type AppContract = typeof contract
