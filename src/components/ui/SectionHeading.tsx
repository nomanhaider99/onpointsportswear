import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small green uppercase eyebrow - Halyard 14px / 900 / uppercase / #00AC3B. */
export function Eyebrow({
  children,
  className,
  boxed = false,
}: {
  children: ReactNode;
  className?: string;
  boxed?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-sm font-black uppercase tracking-normal text-primary",
        boxed &&
          "inline-block rounded border border-[var(--color-primary-line)] bg-[var(--color-primary-soft)] px-2.5 py-[5px]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Large display heading - Halyard Display Bold, 48px desktop / 36px tablet / 30px mobile,
 * weight 600, letter-spacing -0.2px.
 */
export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "font-[family-name:var(--font-halyard-bold)] text-[30px] font-semibold leading-[1.15] tracking-[-0.2px] text-white md:text-[36px] lg:text-[48px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
