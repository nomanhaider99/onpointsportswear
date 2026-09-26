"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { bounceToApp } from "@/lib/app-return";

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
    bounceToApp(appReturn, { orderId, paid: false });
  }, [params]);

  return null;
}
