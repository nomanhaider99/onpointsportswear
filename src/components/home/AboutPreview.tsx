import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Source layout - heading row, then a 70/30 split where the copy sits at the top
 * of the narrow column above the secondary image.
 */
export function AboutPreview() {
  return (
    <Section>
      <div className="container-site">
        <div className="lg:w-3/4">
          <Eyebrow className="max-md:text-center">ABOUT US</Eyebrow>
          <SectionHeading className="mt-2 max-md:text-center">
            CUSTOM SPORTSWEAR - ENGINEERED IN ONTARIO, SERVING CANADA &amp; USA.
          </SectionHeading>
        </div>
      </div>

      <div className="container-site mt-[25px]">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="lg:w-[70%]">
            <Image
              src="/images/about-main.png"
              alt="Custom sportswear engineered by On Point"
              width={895}
              height={502}
              sizes="(max-width: 1023px) 100vw, 70vw"
              className="h-auto w-full rounded-lg"
            />
          </div>
          <div className="flex flex-col justify-between gap-5 lg:w-[30%]">
            <p className="text-sm text-white/80 md:text-base">
              WE SUPPLY CUSTOM ELITE JERSEYS, PANTS, AND TEAM GEAR TO YOUTH LEAGUES, COLLEGIATE
              PROGRAMS, AND SCHOOL TEAMS. HIGH-IMPACT DESIGN, NO MINIMUM ORDERS.
            </p>
            <Image
              src="/images/about-side.png"
              alt="On Point custom embroidered team hoodie"
              width={329}
              height={390}
              sizes="(max-width: 1023px) 100vw, 30vw"
              className="h-auto w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
