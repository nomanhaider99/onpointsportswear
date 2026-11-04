const PROD_API = "https://backend.onpointsportswear.com/api";
const DEV_API = "http://127.0.0.1:5000/api";

function isLoopback(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function isPublicShopHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes("onpointsportswear") || host.includes("vercel.app");
}

/**
 * Always resolve at call-time (never cache a bad URL from module init).
 * Live shop / production builds always hit the public backend.
 */
export function getApiUrl() {
  if (typeof window !== "undefined" && isPublicShopHost()) return PROD_API;
  if (process.env.NODE_ENV === "production") return PROD_API;

  const raw = String(process.env.NEXT_PUBLIC_API_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (raw && !isLoopback(raw)) return raw;
  if (raw && isLoopback(raw) && typeof window !== "undefined" && window.location.protocol === "https:") {
    return PROD_API;
  }
  return raw || DEV_API;
}

/** @deprecated Prefer getApiUrl() — kept for existing imports. */
export const API_URL = PROD_API;
export const API_ORIGIN = PROD_API.replace(/\/api$/, "");

export const WEB_URL = String(process.env.NEXT_PUBLIC_WEB_URL || "https://onpointsportswear.com")
  .trim()
  .replace(/\/$/, "");

export const JERSEY_STUDIO_URL = String(
  process.env.NEXT_PUBLIC_JERSEY_STUDIO_URL ||
    process.env.NEXT_PUBLIC_CUSTOMIZER_URL ||
    "https://customizer.onpointsportswear.com",
)
  .trim()
  .replace(/\/$/, "");

export { PROD_API };
