"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppReturnButton } from "@/components/checkout/AppReturnButton";
import { bounceToApp } from "@/lib/app-return";

/**
 * Short HTTPS landing Stripe/PayPal can redirect to, then immediately
 * deep-link back into the app (required — Stripe rejects custom schemes).
 */
function AppReturnInner() {
  const params = useSearchParams();
  const appReturn = params.get("appReturn") || params.get("return") || "";
  const orderId = params.get("orderId") || "";
  const paid = params.get("paid") === "1" || params.get("paid") === "true";
  const cancelled = params.get("cancelled") === "1";
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!appReturn) return;
    setTried(true);
    bounceToApp(appReturn, { orderId, paid: paid && !cancelled });
    const again = window.setTimeout(() => {
      bounceToApp(appReturn, { orderId, paid: paid && !cancelled });
    }, 800);
    return () => window.clearTimeout(again);
  }, [appReturn, orderId, paid, cancelled]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h1 className="mt-4 text-xl font-bold uppercase text-white">
        {cancelled ? "Returning to the app…" : "Opening the On Point app…"}
      </h1>
      <p className="mt-2 text-sm text-white/65">
        {tried
          ? "If the app did not open automatically, tap the button below."
          : "Please wait a moment."}
      </p>
      {appReturn ? (
        <AppReturnButton
          appReturn={appReturn}
          orderId={orderId}
          paid={paid && !cancelled}
          label="Return to On Point app"
        />
      ) : (
        <p className="mt-6 text-sm text-[#ff6b6b]">Missing app return link. Close this tab and reopen the app.</p>
      )}
    </main>
  );
}

export default function CheckoutAppReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16 text-center text-white">Returning to the app…</main>
      }
    >
      <AppReturnInner />
    </Suspense>
  );
}
