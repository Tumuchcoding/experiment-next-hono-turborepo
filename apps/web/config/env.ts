const normalize = (value: string | undefined, fallback: string) => {
  const normalized = (value ?? fallback).trim();
  return normalized.endsWith("/") && normalized !== "/" && normalized !== ""
    ? normalized.slice(0, -1)
    : normalized;
};

export const env = {
  apiBase: normalize(process.env.NEXT_PUBLIC_API_URL, "/api"),
  webBase: normalize(
    process.env.NEXT_PUBLIC_WEB_URL,
    "http://localhost:3001"
  ),
  apiProxyTarget: normalize(
    process.env.API_PROXY_TARGET,
    "http://localhost:3002"
  ),
} as const;

export const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);
