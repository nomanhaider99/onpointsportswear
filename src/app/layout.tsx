import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/data/site";
import "./globals.css";

/**
 * The source site registers three separate Halyard Display families
 * (Book / Bold / Black) and relies on synthetic bolding within each.
 * Registering them the same way keeps the rendered weight identical.
 */
const halyardBook = localFont({
  src: "../../public/fonts/HalyardDisplay-Book.ttf",
  variable: "--font-halyard-book",
  display: "swap",
});

const halyardBold = localFont({
  src: "../../public/fonts/HalyardDisplay-Bold.ttf",
  variable: "--font-halyard-bold-face",
  display: "swap",
});

const halyardBlack = localFont({
  src: "../../public/fonts/HalyardDisplay-Black.ttf",
  variable: "--font-halyard-black-face",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    images: [{ url: "/images/hero-main.png", width: 705, height: 765, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/images/hero-main.png"],
  },
  icons: { icon: "/images/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${halyardBook.variable} ${halyardBold.variable} ${halyardBlack.variable} ${inter.variable}`}
    >
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
