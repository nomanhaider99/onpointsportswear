"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { paymentsApi } from "@/lib/api/client";
import { AppReturnButton } from "@/components/checkout/AppReturnButton";
import { bounceToApp } from "@/lib/app-return";
import { markJerseyStudioCartForClear } from "@/lib/jersey-cart-clear";
import { clearCart } from "@/store/features/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";

export default function CheckoutSuccessInner() {
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const orderId = params.get("orderId") || "";
  const guest = params.get("guest") || "";
  const appReturn = params.get("appReturn") || "";
  const fromApp = params.get("source") === "app" || Boolean(appReturn);
  const [paid, setPaid] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bounced, setBounced] = useState(false);

  const sendToApp = (isPaid: boolean) => {
    if (!fromApp || !appReturn || bounced) return;
    setBounced(true);
    bounceToApp(appReturn, { orderId, paid: isPaid });
  };

  useEffect(() => {
    if (!orderId) {
      setError("Missing order id.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        if (guest || orderId) {
          try {
            await paymentsApi.stripeSyncSession({ orderId, guestToken: guest });
          } catch {
            /* may not be a Stripe order */
          }
        }
        const status = await paymentsApi.status(orderId, guest);
        if (cancelled) return;
        setTrackingId(String(status.trackingId || ""));
        if (status.paid) {
          setPaid(true);
          setLoading(false);
          dispatch(clearCart());
          markJerseyStudioCartForClear();
          sendToApp(true);
          return;
        }
        attempts += 1;
        // For app checkouts, don't leave the user on the website — bounce after a short wait.
        if (fromApp && appReturn && attempts >= 2) {
          setLoading(false);
          setError("Payment is still processing. Returning you to the app…");
          sendToApp(false);
          return;
        }
        if (attempts < 12) {
          setTimeout(poll, 1200);
        } else {
          setLoading(false);
          setError(
            "Payment is still processing. If you were charged, your order will update shortly.",
          );
          sendToApp(false);
        }
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        setError(err instanceof Error ? err.message : "Could not verify payment.");
        sendToApp(false);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bounce once per mount
  }, [orderId, guest, dispatch, fromApp, appReturn]);

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      {loading ? (
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>{fromApp ? "Confirming payment and returning to the app…" : "Confirming your payment…"}</p>
        </div>
      ) : paid ? (
        <div className="rounded-xl border border-border bg-card p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold uppercase text-white">Payment successful</h1>
          <p className="mt-2 text-white/70">
            Thanks — your order {trackingId || orderId} is paid and being processed.
          </p>
          {fromApp && appReturn ? (
            <AppReturnButton appReturn={appReturn} orderId={orderId} paid label="Back to app" />
          ) : (
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-primary-foreground"
            >
              Continue shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-8 text-left">
          <h1 className="text-xl font-bold text-white">Payment status</h1>
          <p className="mt-2 text-white/80">{error || "Payment not confirmed yet."}</p>
          {fromApp && appReturn ? (
            <AppReturnButton
              appReturn={appReturn}
              orderId={orderId}
              paid={false}
              label="Return to app"
            />
          ) : (
            <Link href="/checkout" className="mt-4 inline-block text-primary underline">
              Back to checkout
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
