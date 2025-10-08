// api/utils/http.ts
import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { HTTP_STATUS_CODE } from "./http-status-code"

export type ApiError = { error: string }

// Explicit return types prevent TS from emitting a non-portable type
export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  message = "Request failed"
): Response {
  return c.json<ApiError>({ error: message }, status) as unknown as Response
}

export function jsonOk<T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = HTTP_STATUS_CODE["200_OK"]
): Response {
  return c.json<T>(data, status) as unknown as Response
}

/** Minimal, provider-agnostic normalization */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().normalize("NFKC")
}