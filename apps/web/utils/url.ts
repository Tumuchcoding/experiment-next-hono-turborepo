import { env, isAbsoluteUrl } from "@/config/env";

const ensureLeadingSlash = (value: string) => {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
};

export const BASE_URL = {
  API: env.apiBase === "/" ? "" : env.apiBase,
  WEB: env.webBase,
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
