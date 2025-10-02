import type { ContentfulStatusCode } from "hono/utils/http-status"

export const HTTP_STATUS_CODE: Record<string, ContentfulStatusCode> = {
  "200_OK": 200,
  "201_CREATED": 201,
  "400_BAD_REQUEST": 400,
  "401_UNAUTHORIZED": 401,
  "409_CONFLICT": 409,
  "500_INTERNAL_SERVER_ERROR": 500,
} as const
