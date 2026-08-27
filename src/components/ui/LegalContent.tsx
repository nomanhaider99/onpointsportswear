import type { ReactNode } from "react";

/** Shared prose wrapper for the Privacy Policy and Terms of Service pages. */
export function LegalContent({ children }: { children: ReactNode }) {
  return (
    <div className="container-site mt-10 max-w-3xl space-y-8 text-base leading-relaxed text-white/80 [&_a]:text-primary [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1.5">
      {children}
    </div>
  );
}
