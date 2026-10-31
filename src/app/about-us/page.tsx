import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/about/StatCounter";
import { aboutStats } from "@/data/team";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "On Point Sportswear was created from a lifelong passion for sports and years of firsthand experience as a player, coach, team manager, and league organizer. Built to Perform. Designed to Stand Out.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    url: "/about-us",
    title: "About On Point Sportswear",
    description:
      "Apparel programs designed by someone who understands sports from the inside — helping every athlete look, feel, and perform their best.",
  },
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-0">
        <div className="container-site text-center">
          <SectionHeading as="h1">
            ABOUT <span className="text-primary">ON POINT</span>
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/80 md:text-lg">
            BUILT TO PERFORM. DESIGNED TO STAND OUT.
          </p>
        </div>

        <div className="container-site mt-[50px] flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="lg:w-1/2 max-lg:text-center">
            <Eyebrow boxed>OUR STORY</Eyebrow>
            <h2 className="mt-[25px] text-[30px] font-semibold leading-tight text-white md:text-[32px] lg:w-[90%]">
              DESIGNED BY SOMEONE WHO UNDERSTANDS SPORTS{" "}
              <span className="text-primary">FROM THE INSIDE</span>.
            </h2>
            <div className="mt-5 space-y-4 text-base text-white/80 md:text-lg">
              <p>
                On Point Sportswear was created from a lifelong passion for sports and years of
                firsthand experience as a player, coach, team manager, and league
                organizer/coordinator.
              </p>
              <p>
                Being involved in sports from so many different perspectives has given me a strong
                understanding of what players, coaches, teams, and organizations truly need when it
                comes to uniforms and apparel. I understand the importance of quality, comfort,
                performance, organization, and having a supplier you can depend on.
              </p>
              <p>
                But to me, team apparel is about more than just what you wear. A great uniform helps
                create pride, confidence, identity, and a sense of belonging. When players put on
                their team colours, they should feel like they are part of something bigger than
                themselves.
              </p>
              <p>
                That experience and belief are what inspired me to create On Point Sportswear — to
                provide teams and organizations with apparel programs designed by someone who
                understands sports from the inside.
              </p>
              <p>
                Our goal is simple: make the apparel process easier for coaches and organizations
                while helping every athlete look, feel, and perform their best.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/images/about-story.png"
              alt="On Point Sportswear custom team apparel"
              width={560}
              height={380}
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="h-auto w-full rounded-lg"
            />
          </div>
        </div>
      </Section>

      <section className="border-y border-[var(--color-primary-line)] py-[50px]">
        <div className="container-site grid grid-cols-2 gap-8 lg:grid-cols-4">
          {aboutStats.map((stat) => (
            <StatCounter key={stat.id} stat={stat} />
          ))}
        </div>
      </section>
    </>
  );
}
