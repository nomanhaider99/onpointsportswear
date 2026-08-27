import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";

export function ContactSection() {
  return (
    <Section tinted id="contact">
      <div className="container-site flex flex-col gap-10 lg:flex-row">
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
