import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ServicesGrid } from "./ServicesGrid";

export function ServicesPreview() {
  return (
    <Section>
      <div className="container-site">
        <div className="lg:w-[90%]">
          <Eyebrow className="max-md:text-center">SERVICES</Eyebrow>
          <SectionHeading className="mt-2 max-md:text-center">
            WHAT WE OFFER - FROM CONCEPT TO COURT.
          </SectionHeading>
        </div>
      </div>
      <ServicesGrid />
    </Section>
  );
}
