const rawNodeEnv = process.env.NODE_ENV ?? "development";

const rawAllowedOrigins =
  process.env.API_ALLOWED_ORIGINS ?? "http://localhost:3001";

const rawCookieDomain = process.env.SESSION_COOKIE_DOMAIN?.trim();
const rawCookieSecure = process.env.SESSION_COOKIE_SECURE;
const rawCookieSameSite = process.env.SESSION_COOKIE_SAMESITE;

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value === "true";
};

const normalizeSameSite = (value: string | undefined) => {
  const candidate = value?.toLowerCase();
  switch (candidate) {
    case "strict":
    case "lax":
    case "none":
      return candidate;
    default:
      return undefined;
  }
};

export const env = {
  nodeEnv: rawNodeEnv,
  isProduction: rawNodeEnv === "production",
  allowedOrigins: rawAllowedOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  sessionCookie: {
    domain: rawCookieDomain ? rawCookieDomain : undefined,
    sameSite: normalizeSameSite(rawCookieSameSite),
    secure: toBoolean(rawCookieSecure, rawNodeEnv === "production"),
  },
} as const;
