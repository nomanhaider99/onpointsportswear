import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { faqClosing, faqIntro, faqs } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about On Point Sportswear custom jerseys, turnaround times, shipping, sizing, and ordering.",
  alternates: { canonical: "/faq" },
  openGraph: {
    url: "/faq",
    title: "FAQ | On Point Sportswear",
    description: faqIntro,
  },
};

export default function FaqPage() {
  return (
    <Section>
      <div className="container-site text-center">
        <Eyebrow boxed>ON POINT SPORTSWEAR</Eyebrow>
        <SectionHeading as="h1" className="mt-2.5">
          FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white/80 md:text-lg">{faqIntro}</p>
      </div>

      <div className="container-site">
        <FaqAccordion items={faqs} />

        <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-[var(--color-primary-line)] bg-primary-soft px-5 py-8 text-center sm:px-8">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{faqClosing.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:text-base">{faqClosing.body}</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#029b36]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </Section>
  );
}
