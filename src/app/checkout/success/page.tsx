"use client";

import { Suspense } from "react";
import CheckoutSuccessInner from "./CheckoutSuccessInner";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-xl px-4 py-16 text-center text-white">
          Confirming your payment…
        </main>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  );
}
