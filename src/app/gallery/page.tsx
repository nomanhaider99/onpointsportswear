import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real teams. Real matches. Explore our pro-grade custom uniforms and high-impact spirit wear engineered for pure athletic performance.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    url: "/gallery",
    title: "Our Gallery | On Point Sportswear",
    description:
      "Real teams. Real matches. Pro-grade custom uniforms and high-impact spirit wear.",
    images: [{ url: "/images/gallery/gallery-5.png", alt: "On Point Sportswear gallery" }],
  },
};

export default function GalleryPage() {
  return (
    <Section>
      <div className="container-site text-center">
        <SectionHeading as="h1">
          OUR <span className="text-primary">GALLERY</span>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          Real teams. Real matches. Explore our pro-grade custom uniforms and high-impact spirit
          wear engineered for pure athletic performance.
        </p>
      </div>
      <GalleryGrid />
    </Section>
  );
}
