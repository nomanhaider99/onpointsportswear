import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Source sections use 50px vertical padding; tinted ones add #032BEC33. */
export function Section({
  id,
  tinted = false,
  className,
  children,
}: {
  id?: string;
  tinted?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("py-[50px]", tinted && "bg-[var(--color-tint)]", className)}
    >
      {children}
    </section>
  );
}
