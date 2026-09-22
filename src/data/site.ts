export const siteConfig = {
  name: "On Point Sportswear",
  title: "On Point Sportswear | Custom Sportswear",
  description:
    "Custom sportswear engineered in Ontario for leagues, schools & clubs across Canada & USA. Sublimation & embroidery with no minimums and fast turnaround.",
  /** From NEXT_PUBLIC_WEB_URL / NEXT_PUBLIC_SITE_URL in .env */
  url: String(process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, ""),
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
