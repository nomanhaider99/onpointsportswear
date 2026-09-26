import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutAppReturnBounce } from "@/components/checkout/CheckoutAppReturnBounce";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your custom sportswear order with On Point Sportswear.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <Section>
      <div className="container-site">
        <SectionHeading as="h1">
          CHECK <span className="text-primary">OUT</span>
        </SectionHeading>
      </div>
      <div className="container-site mt-[50px]">
        <Suspense fallback={null}>
          <CheckoutAppReturnBounce />
        </Suspense>
        <CheckoutFlow />
      </div>
    </Section>
  );
}
