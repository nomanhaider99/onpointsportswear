import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Source layout - a two column row:
 *   left  (52%): h1, supporting copy, buttons, then a 40/60 row of the two
 *                detail shots, pushed down 75px
 *   right (48%): the full-bleed hero garment
 */
export function Hero() {
  return (
    <section className="pb-[50px] pt-6 lg:pt-10">
      <div className="container-site flex flex-col gap-8 lg:flex-row lg:gap-6">
        <div className="w-full text-center lg:w-[52%] lg:text-left">
          <h1 className="font-[family-name:var(--font-halyard-bold)] text-[30px] font-semibold leading-[1.1] tracking-[-0.2px] text-white md:text-[48px] lg:text-[64px]">
            BUILT TO <span className="text-primary">PERFORM</span>. DESIGNED TO{" "}
            <span className="text-primary">STAND OUT</span>.
          </h1>
          <p className="mt-5 text-sm text-white/80 md:text-base">
            SUBLMATION &amp; EMBROIDERY FOR LEAGUES, SCHOOLS &amp; CLUBS. NO MINIMUMS. PRO-GRADE
            QUALITY. FAST TURNAROUND.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
            <ButtonLink href="/products">SHOP NOW</ButtonLink>
            <ButtonLink href="/products" variant="outline">
              EXPLORE COLLECTION
            </ButtonLink>
          </div>

          <div className="mt-[75px] flex items-start justify-center gap-4 lg:justify-start">
            <div className="w-[40%] max-w-[210px]">
              <Image
                src="/images/hero-badge-1.png"
                alt="Custom embroidered team quarter-zip"
                width={210}
                height={222}
                priority
                sizes="(max-width: 767px) 40vw, 210px"
                className="h-auto w-full"
              />
            </div>
            <div className="w-[40%] max-w-[210px]">
              <Image
                src="/images/hero-badge-2.png"
                alt="Custom sublimated technical outerwear"
                width={210}
                height={222}
                priority
                sizes="(max-width: 767px) 40vw, 210px"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[48%]">
          <Image
            src="/images/hero-main.png"
            alt="On Point Sportswear custom team jacket"
            width={705}
            height={765}
            priority
            sizes="(max-width: 1023px) 100vw, 48vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
