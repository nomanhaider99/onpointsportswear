"use client";

import Script from "next/script";
import { Suspense } from "react";
import CheckoutSuccessInner from "./CheckoutSuccessInner";

/**
 * Inline script runs before React hydrates so the in-app browser can close
 * immediately via onpoint:// (openAuthSessionAsync return URL).
 */
const EARLY_BOUNCE = `
(function () {
  try {
    var q = new URLSearchParams(window.location.search);
    var fromApp = q.get("source") === "app" || q.get("appReturn") || q.get("paid") === "1";
    if (!fromApp) return;
    var orderId = q.get("orderId") || "";
    var paid = q.get("cancelled") === "1" ? "0" : "1";
    var base = q.get("appReturn") || "onpoint://payment-return";
    var url;
    try {
      url = new URL(base);
      if (orderId) url.searchParams.set("orderId", orderId);
      url.searchParams.set("paid", paid);
      url = url.toString();
    } catch (e) {
      url = base + (base.indexOf("?") >= 0 ? "&" : "?") + "orderId=" + encodeURIComponent(orderId) + "&paid=" + paid;
    }
    window.location.replace(url);
  } catch (e) {}
})();
`;

export default function CheckoutSuccessPage() {
  return (
    <>
      <Script id="app-return-bounce" strategy="beforeInteractive">
        {EARLY_BOUNCE}
      </Script>
      <Suspense
        fallback={
          <main className="mx-auto max-w-xl px-4 py-16 text-center text-white">
            Payment OK — returning to the app…
          </main>
        }
      >
        <CheckoutSuccessInner />
      </Suspense>
    </>
  );
}
