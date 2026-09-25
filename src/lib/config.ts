const PROD_API = "https://backend.betterbuildsc.com/api";
const DEV_API = "http://127.0.0.1:5000/api";

function isLoopback(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function isPublicShopHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes("onpointsportswear") ||
    host.includes("vercel.app") ||
    host.includes("betterbuildsc.com")
  );
}

/**
 * Production / live shop always use the public backend.
 * Vercel env sometimes still has 127.0.0.1 baked in — never call loopback from HTTPS.
 */
function resolveApiUrl() {
  if (isPublicShopHost()) return PROD_API;
  if (process.env.NODE_ENV === "production") return PROD_API;

  const raw = String(process.env.NEXT_PUBLIC_API_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (raw && !isLoopback(raw)) return raw;
  return raw || DEV_API;
}

const API_URL = resolveApiUrl();
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

export const WEB_URL = String(process.env.NEXT_PUBLIC_WEB_URL || "")
  .trim()
  .replace(/\/$/, "");

export const JERSEY_STUDIO_URL = String(
  process.env.NEXT_PUBLIC_JERSEY_STUDIO_URL ||
    process.env.NEXT_PUBLIC_CUSTOMIZER_URL ||
    "https://customizer.betterbuildsc.com",
)
  .trim()
  .replace(/\/$/, "");

export { API_URL, PROD_API };
