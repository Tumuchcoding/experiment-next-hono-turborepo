import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "../config/env.js";
import { JWT_SECRET } from "./constant.util.js";

export const EXPIRATION_TIME_IN_MILLISECONDS = 31_536_000_000; // 1 year
export const JWT_ALGORITHM = "HS256";

type SameSiteSetting = "lax" | "strict" | "none";

const DEFAULT_SAME_SITE: SameSiteSetting = env.isProduction ? "none" : "lax";

const sessionCookieOptions = {
  domain: env.sessionCookie.domain,
  httpOnly: true,
  path: "/",
  priority: "medium" as const,
  sameSite: (env.sessionCookie.sameSite ??
    DEFAULT_SAME_SITE) as SameSiteSetting,
  secure: env.sessionCookie.secure,
};

const getCookieOptions = () => sessionCookieOptions;

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
