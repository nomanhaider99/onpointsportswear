function resolveSiteUrl() {
  const raw = String(
    process.env.NEXT_PUBLIC_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      "https://onpointsportswear.vercel.app",
  )
    .trim()
    .replace(/\/$/, "");

  if (!raw) return "https://onpointsportswear.vercel.app";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/\//, "")}`;
}

export const siteConfig = {
  name: "On Point Sportswear",
  title: "On Point Sportswear | Custom Sportswear",
  description:
    "Custom sportswear engineered in Ontario for leagues, schools & clubs across Canada & USA. Sublimation & embroidery with no minimums and fast turnaround.",
  /** Production site origin for metadataBase / OG URLs. */
  url: resolveSiteUrl(),
  email: "onpointpromotions23@gmail.com",
  phone: "647-805-5730",
  phoneHref: "tel:+16478055730",
  credit: {
    label: "Design & Developed By Premium Web Agency.", 
    href: "https://premiumwebagency.com/",
  },
  footerBlurb: [
    "Custom sportswear engineered in Ontario for leagues, schools & clubs across Canada & USA.",
    "Sublimation & embroidery for teams that demand quality, fit, and fast turnaround.",
  ],
  interestedInOptions: [
    "Custom Jerseys",
    "Team Uniforms",
    "Sublimation",
    "Embroidery",
  ],
};
