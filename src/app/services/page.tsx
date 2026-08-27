import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ServicesGrid } from "@/components/home/ServicesGrid";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom jerseys, sublimation printing, embroidery, sports pants & shorts, school spirit wear and tournament packages — from concept to court.",
  alternates: { canonical: "/services" },
  openGraph: {
    url: "/services",
    title: "Services | On Point Sportswear",
    description: "What we offer - from concept to court. No minimums, fast turnaround.",
  },
};

export default function ServicesPage() {
  return (
    <Section>
      <div className="container-site">
        <div className="lg:w-[90%]">
          <Eyebrow className="max-md:text-center">SERVICES</Eyebrow>
          <SectionHeading as="h1" className="mt-2 max-md:text-center">
            WHAT WE OFFER - FROM CONCEPT TO COURT.
          </SectionHeading>
        </div>
      </div>
      <ServicesGrid />
    </Section>
  );
}
