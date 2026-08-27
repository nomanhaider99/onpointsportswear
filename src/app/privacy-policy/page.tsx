import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LegalContent } from "@/components/ui/LegalContent";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects the information you share with us.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <Section>
      <div className="container-site">
        <SectionHeading as="h1">
          PRIVACY <span className="text-primary">POLICY</span>
        </SectionHeading>
      </div>

      <LegalContent>
        <section>
          <h2>Overview</h2>
          <p>
            {siteConfig.name} respects your privacy. This policy explains what information we
            collect when you use this website, why we collect it, and the choices you have.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <ul>
            <li>
              <strong className="text-white">Information you give us.</strong> When you submit the
              contact form we receive your name, email address, phone number, the option you select
              under &ldquo;Interested In&rdquo;, and your message.
            </li>
            <li>
              <strong className="text-white">Cart information.</strong> The products, sizes and
              quantities you add to your cart are stored locally in your own browser so your cart
              survives a refresh. This data stays on your device and is not transmitted to us.
            </li>
            <li>
              <strong className="text-white">Technical information.</strong> Our hosting provider
              may log standard request data such as IP address, browser type and pages visited, for
              security and reliability purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>
            We use the information you send us to answer your enquiry, prepare quotes for team
            orders, and follow up about your order. We do not sell your personal information, and we
            do not use it for advertising by third parties.
          </p>
        </section>

        <section>
          <h2>Payment Information</h2>
          <p>
            This website does not process payments and does not collect credit card or banking
            details. Orders are quoted and arranged directly with our team.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            Enquiries are kept only as long as needed to respond and to service your order, plus any
            period required for our business records. You may ask us to delete your enquiry at any
            time.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You can request access to, correction of, or deletion of the personal information you
            have sent us. You can clear your cart at any time from the cart page, which removes that
            data from your browser storage.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or call{" "}
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>.
          </p>
        </section>
      </LegalContent>
    </Section>
  );
}
