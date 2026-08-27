import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Have a question about a product, team packages, or custom design? Email ${siteConfig.email} or call ${siteConfig.phone}.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact Us | On Point Sportswear",
    description:
      "Have a question about a product, team packages, or custom design? We're here to gear you up.",
  },
};

export default function ContactPage() {
  return (
    <Section className="pt-0">
      <div className="container-site flex flex-col items-center text-center">
        <Eyebrow boxed>GET IN TOUCH</Eyebrow>
        <SectionHeading as="h1" className="mt-2.5">
          CONTACT US
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          Have a question about a product, team packages, or custom design? We&apos;re here to gear
          you up.
        </p>
      </div>

      <div className="container-site mt-[50px] flex flex-col gap-10 lg:flex-row">
        <div className="lg:w-[45%]">
          <Eyebrow className="max-md:text-center">CONTACT US</Eyebrow>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            Have a question about a product, your order, or need assistance? Our team is here to
            help. Fill out the form below, and we&apos;ll get back to you as soon as possible.
          </p>
          <ContactDetails className="mt-[25px]" />
        </div>
        <div className="lg:w-[55%]">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
