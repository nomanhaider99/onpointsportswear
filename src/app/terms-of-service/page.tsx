import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LegalContent } from "@/components/ui/LegalContent";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply when you use the ${siteConfig.name} website and order custom team gear from us.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <Section>
      <div className="container-site">
        <SectionHeading as="h1">
          TERMS OF <span className="text-primary">SERVICE</span>
        </SectionHeading>
      </div>

      <LegalContent>
        <section>
          <h2>Agreement</h2>
          <p>
            By using this website you agree to these terms. If you do not agree, please do not use
            the site.
          </p>
        </section>

        <section>
          <h2>Products and Pricing</h2>
          <p>
            Prices shown are in Canadian dollars and are presented as a range because our garments
            are made to order in different sizes and specifications. Prices, product availability
            and specifications may change without notice. A final price is confirmed when we quote
            your order.
          </p>
        </section>

        <section>
          <h2>Orders</h2>
          <p>
            Adding items to the cart on this website is a request, not a completed purchase. No
            payment is taken through this site. Our team confirms artwork, sizing, quantities,
            turnaround and final pricing with you before production begins.
          </p>
        </section>

        <section>
          <h2>Custom and Personalised Items</h2>
          <p>
            Because jerseys, uniforms and spirit wear are produced to your specification, custom
            orders cannot be cancelled or returned once production has started, except where the
            item is faulty or does not match the approved artwork and specification.
          </p>
        </section>

        <section>
          <h2>Artwork and Intellectual Property</h2>
          <p>
            You confirm that you own or are licensed to use any logo, crest, name or artwork you
            supply to us, and that our use of it for your order does not infringe anyone
            else&apos;s rights. All content on this website — including text, images, layout and
            branding — belongs to {siteConfig.name} unless stated otherwise.
          </p>
        </section>

        <section>
          <h2>Colour and Finish</h2>
          <p>
            Sublimation and embroidery results can vary slightly between production runs and
            between fabrics, and screen colours may differ from printed colours. Minor variation is
            not treated as a defect.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the extent permitted by law, our liability in connection with an order is limited to
            the amount paid for that order. We are not liable for indirect or consequential loss.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or call{" "}
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>.
          </p>
        </section>
      </LegalContent>
    </Section>
  );
}
