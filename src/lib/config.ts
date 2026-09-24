const PROD_API = "https://backend.betterbuildsc.com/api";
const DEV_API = "http://127.0.0.1:5000/api";

function isLoopback(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function resolveApiUrl() {
  const raw = String(process.env.NEXT_PUBLIC_API_URL || "")
    .trim()
    .replace(/\/$/, "");
  const onVercel = Boolean(process.env.VERCEL);
  const isProd = process.env.NODE_ENV === "production" || onVercel;

  // Public HTTPS deploys must never call loopback (browser blocks Private Network Access).
  if (isProd && (!raw || isLoopback(raw))) return PROD_API;
  if (raw) return raw;
  return isProd ? PROD_API : DEV_API;
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

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("[config] NEXT_PUBLIC_API_URL missing — using", API_URL);
}

export { API_URL };
