const API_URL = String(process.env.NEXT_PUBLIC_API_URL || "")
  .trim()
  .replace(/\/$/, "");
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

export const WEB_URL = String(process.env.NEXT_PUBLIC_WEB_URL || "")
  .trim()
  .replace(/\/$/, "");

export const JERSEY_STUDIO_URL = String(
  process.env.NEXT_PUBLIC_JERSEY_STUDIO_URL || process.env.NEXT_PUBLIC_CUSTOMIZER_URL || "",
)
  .trim()
  .replace(/\/$/, "");

if (typeof window !== "undefined") {
  if (!API_URL) console.warn("[config] NEXT_PUBLIC_API_URL missing in onpointsportswear/.env");
  if (!JERSEY_STUDIO_URL) console.warn("[config] NEXT_PUBLIC_JERSEY_STUDIO_URL missing in onpointsportswear/.env");
}

export { API_URL };
