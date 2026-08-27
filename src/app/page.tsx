import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { AboutPreview } from "@/components/home/AboutPreview";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ContactSection } from "@/components/home/ContactSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: siteConfig.title, description: siteConfig.description },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <ServicesPreview />
      <FeaturedProducts />
      <ContactSection />
      <FinalCTA />
    </>
  );
}
