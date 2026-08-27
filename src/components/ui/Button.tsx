import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";

/**
 * Source styling:
 *  primary  - bg #00AC3B, text #0B1020, radius 8px, padding 12px 24px, 16px Halyard
 *  outline  - transparent, 1px #00AC3B border, white text, same metrics
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-normal leading-none transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-[#029b36]",
  outline: "border border-primary text-white hover:bg-primary hover:text-primary-foreground",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
