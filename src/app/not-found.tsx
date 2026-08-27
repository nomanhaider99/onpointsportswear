import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function NotFound() {
  return (
    <Section>
      <div className="container-site py-20 text-center">
        <SectionHeading as="h1">
          PAGE <span className="text-primary">NOT FOUND</span>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/80 md:text-lg">
          The page you were looking for has moved or no longer exists.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
          >
            BACK HOME
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            SHOP PRODUCTS
          </Link>
        </div>
      </div>
    </Section>
  );
}
