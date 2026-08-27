import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductFilters } from "@/components/products/ProductFilters";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore our high-impact custom sportswear collections. Jerseys, hoodies, shorts and accessories engineered for maximum performance with no minimum orders.",
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: "Pro-Grade Gear | On Point Sportswear",
    description:
      "Explore our high-impact custom sportswear collections. Engineered for maximum performance with no minimum orders.",
  },
};

export default function ProductsPage() {
  return (
    <Section>
      <div className="container-site text-center">
        <SectionHeading as="h1">
          PRO-GRADE <span className="text-primary">GEAR</span>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          Explore our high-impact custom sportswear collections. Engineered for maximum performance
          with no minimum orders.
        </p>
      </div>

      <div className="container-site mt-8">
        <ProductFilters />
      </div>
    </Section>
  );
}
