const COOKIE_NAME = "sporokulu_access_token";

export function getStoredAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function setAccessTokenCookie(token: string): void {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAccessTokenCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/** Middleware ile ayni anahtar; yalnizca UI icin dogrulanmamis okuma. */
export function parseJwtPayloadRole(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64)) as { role?: string };
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}
