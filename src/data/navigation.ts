export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "My Designs", href: "/account/designs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const footerQuickLinks: NavItem[] = mainNav;

export const footerServiceLinks: NavItem[] = [
  { label: "Custom Jerseys", href: "/products" },
  { label: "Team Uniforms", href: "/products" },
  { label: "Sublimation", href: "/products" },
  { label: "Embroidery", href: "/products" },
];

export const footerLegalLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];
