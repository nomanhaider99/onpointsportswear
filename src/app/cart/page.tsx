import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the custom sportswear in your On Point Sportswear cart.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <Section>
      <div className="container-site">
        <SectionHeading as="h1">
          YOUR <span className="text-primary">CART</span>
        </SectionHeading>
      </div>
      <div className="container-site mt-[50px]">
        <CartView />
      </div>
    </Section>
  );
}
