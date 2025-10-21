const normalizeBase = (value: string | undefined, fallback: string) => {
  const normalized = (value ?? fallback).trim();
  if (normalized === "" || normalized === "/") return "";
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
};

const ensureLeadingSlash = (value: string) => {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const BASE_URL = {
  API: normalizeBase(process.env.NEXT_PUBLIC_API_URL, "/api"),
  WEB: normalizeBase(process.env.NEXT_PUBLIC_WEB_URL, "http://localhost:3001"),
};

const getWebOrigin = () => {
  if (typeof window !== "undefined") return window.location.origin;
  const webBase = BASE_URL.WEB;
  if (isAbsoluteUrl(webBase)) return webBase;
  return "http://localhost:3001";
};

export const resolveApiUrl = (path = ""): string => {
  const base = BASE_URL.API;
  const suffix = path ? ensureLeadingSlash(path) : "";

  if (isAbsoluteUrl(base)) {
    return `${base}${suffix}`;
  }

  const apiBase = ensureLeadingSlash(base);
  return `${getWebOrigin()}${apiBase}${suffix}`;
};

export const API = {
  AUTH: {
    SIGNIN_CREDENTIAL: `${BASE_URL.WEB}/api/auth/signin/credential`,
    SIGNOUT: `${BASE_URL.WEB}/api/auth/signout`,
    SIGNUP_CREDENTIAL: `${BASE_URL.WEB}/api/auth/signup/credential`,
    VERIFY: `${BASE_URL.WEB}/api/auth/verify`,
  },
  TEST: `${BASE_URL.WEB}/api/test`,
  USERS: `${BASE_URL.WEB}/api/users`,
}
