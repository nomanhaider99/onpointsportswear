import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative flex min-h-[400px] items-center overflow-hidden">
      <Image
        src="/images/cta-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/72" aria-hidden="true" />
      <div className="container-site relative py-16 text-center">
        <h2 className="mx-auto font-[family-name:var(--font-halyard-bold)] text-[36px] font-semibold leading-[1.1] tracking-[-0.2px] text-white md:text-[48px] lg:w-3/4 lg:text-[64px]">
          READY TO GEAR UP YOUR TEAM?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
          Get custom jerseys, uniforms &amp; team gear - no minimums, fast turnaround.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/products">SHOP NOW</ButtonLink>
        </div>
      </div>
    </section>
  );
}
