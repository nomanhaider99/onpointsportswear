import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/about/StatCounter";
import { aboutStats, teamMembers } from "@/data/team";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "On Point supplies elite custom jerseys, pants and team gear. Engineered in Ontario, serving youth leagues, collegiate programs and school teams across North America.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    url: "/about-us",
    title: "About On Point Sportswear",
    description:
      "Engineered in Ontario, running worldwide. Pro-grade sublimation and high-density embroidery with zero order minimums.",
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
            <Eyebrow boxed>OUR MISSION</Eyebrow>
            <h2 className="mt-[25px] text-[30px] font-semibold leading-tight text-white md:text-[32px] lg:w-[90%]">
              ENGINEERED IN ONTARIO, RUNNING <span className="text-primary">WORLDWIDE</span>.
            </h2>
            <p className="mt-5 text-base text-white/80 md:text-lg">
              At On Point, we supply elite custom jerseys, pants, and team gear designed for
              athletes who refuse to compromise on quality or style. Born out of a passion for pure
              performance in Ontario, Canada, we serve youth leagues, collegiate programs, and
              school teams across North America and beyond. With pro-grade sublimation and
              high-density embroidery, we deliver unmatched durability with zero order minimums.
            </p>
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

      <Section>
        <div className="container-site text-center">
          <SectionHeading>
            THE FORCE BEHIND <span className="text-primary">THE GEAR</span>
          </SectionHeading>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            Dedicated performance specialists committed to making your team stand out.
          </p>
        </div>

        <div className="container-site mt-[50px] grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="rounded-xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary max-md:text-center"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={320}
                height={260}
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                className="h-auto w-full rounded-lg object-cover"
              />
              <h3 className="mt-4 font-[family-name:var(--font-inter)] text-xl font-bold text-secondary">
                {member.name}
              </h3>
              <p className="mt-1 font-[family-name:var(--font-inter)] text-sm text-primary">
                {member.role}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
