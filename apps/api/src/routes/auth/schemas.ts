// api/routes/auth/schemas.ts
import { z } from "zod"

export const SignInBody = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
})
export type SignInBody = z.infer<typeof SignInBody>

export const SignUpBody = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string()
    .min(6)
    .max(200)
    // tweak as you like:
    // .regex(/[A-Z]/, "Must include an uppercase letter")
    // .regex(/[a-z]/, "Must include a lowercase letter")
    // .regex(/\d/, "Must include a digit"),
})
export type SignUpBody = z.infer<typeof SignUpBody>

export const EmptyOk = z.object({ ok: z.literal(true) })
export type EmptyOk = z.infer<typeof EmptyOk>
