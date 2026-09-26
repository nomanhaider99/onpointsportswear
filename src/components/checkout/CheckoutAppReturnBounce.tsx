"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * When Stripe/PayPal cancel returns to /checkout with source=app, bounce back
 * into the app deep link with paid=0 so the auth session closes as unpaid.
 */
export function CheckoutAppReturnBounce() {
  const params = useSearchParams();

  useEffect(() => {
    const appReturn = params.get("appReturn") || "";
    const cancelled = params.get("cancelled") === "1";
    const fromApp = params.get("source") === "app" || Boolean(appReturn);
    if (!fromApp || !appReturn || !cancelled) return;

    const orderId = params.get("orderId") || "";
    try {
      const url = new URL(appReturn);
      if (orderId) url.searchParams.set("orderId", orderId);
      url.searchParams.set("paid", "0");
      window.location.href = url.toString();
    } catch {
      const join = appReturn.includes("?") ? "&" : "?";
      window.location.href = `${appReturn}${join}orderId=${encodeURIComponent(orderId)}&paid=0`;
    }
  }, [params]);

  return null;
}
