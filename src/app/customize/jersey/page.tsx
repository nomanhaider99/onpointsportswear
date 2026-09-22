import { Suspense } from "react";
import type { Metadata } from "next";
import { JerseyStudioEmbed } from "@/components/customizer/JerseyStudioEmbed";

export const metadata: Metadata = {
  title: "Customize Hockey Jersey | On Point Sportswear",
  robots: { index: false, follow: false },
};

export default function CustomizeJerseyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#0b1020] text-white">
          Loading jersey studio…
        </div>
      }
    >
      <JerseyStudioEmbed />
    </Suspense>
  );
}
