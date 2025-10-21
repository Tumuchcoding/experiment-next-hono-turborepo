import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { JWT_SECRET } from "./constant.util.js";

export const EXPIRATION_TIME_IN_MILLISECONDS = 31_536_000_000; // 1 year
export const JWT_ALGORITHM = "HS256";

type SameSiteSetting = "lax" | "strict" | "none";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN?.trim();

const COOKIE_SECURE =
  process.env.SESSION_COOKIE_SECURE !== undefined
    ? process.env.SESSION_COOKIE_SECURE === "true"
    : NODE_ENV === "production";

const COOKIE_SAME_SITE = normalizeSameSite(
  process.env.SESSION_COOKIE_SAMESITE,
  NODE_ENV === "production" ? "none" : "lax"
);

function normalizeSameSite(
  value: string | undefined,
  fallback: SameSiteSetting
): SameSiteSetting {
  const lowered = value?.toLowerCase();

  switch (lowered) {
    case "strict":
      return "strict";
    case "lax":
      return "lax";
    case "none":
      return "none";
    default:
      return fallback;
  }
}

function getCookieOptions() {
  return {
    domain: COOKIE_DOMAIN || undefined,
    httpOnly: true,
    path: "/",
    priority: "medium" as const,
    sameSite: COOKIE_SAME_SITE,
    secure: COOKIE_SECURE,
  };
}

export function deleteSession(context: Context): void {
  deleteCookie(context, "session", getCookieOptions());
}

export function getSession(context: Context): string | undefined {
  return getCookie(context, "session");
}

interface SetSessionParams {
  context: Context;
  id: number;
  now: Date;
}

export async function setSession(params: SetSessionParams): Promise<void> {
  const { context, id, now } = params;
  const session = await signSession({ id, now });
  const expirationDate = new Date(
    now.getTime() + EXPIRATION_TIME_IN_MILLISECONDS
  );

  setCookie(context, "session", session, {
    ...getCookieOptions(),
    expires: expirationDate,
  });
}

interface SignSessionParams extends JWTPayload {
  id: number;
  now: Date;
}

export async function signSession(params: SignSessionParams): Promise<string> {
  const { id, now } = params;
  const expiresAt = Math.floor(
    (now.getTime() + EXPIRATION_TIME_IN_MILLISECONDS) / 1000
  );
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload = {
    exp: expiresAt,
    iat: issuedAt,
    iss: "experiment-next-hono-turborepo",
    sub: id,
    ...params,
  };
  return sign(payload, JWT_SECRET, JWT_ALGORITHM);
}

export async function verifySession(session: string): Promise<JWTPayload> {
  return verify(session, JWT_SECRET, JWT_ALGORITHM);
}
