"use client";

import { FormEvent, useState } from "react";
import { computeCartTotals, type CartTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  totals: CartTotals;
  couponCode?: string;
  onApplyCoupon?: (code: string) => Promise<void> | void;
  onRemoveCoupon?: () => void;
  showPromo?: boolean;
  className?: string;
};

/** Shared Subtotal / Shipping / Discount / Total block (matches app cart). */
export function CartTotalsBreakdown({
  totals,
  couponCode = "",
  onApplyCoupon,
  onRemoveCoupon,
  showPromo = false,
  className,
}: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!onApplyCoupon || busy) return;
    setBusy(true);
    setError("");
    try {
      await onApplyCoupon(code.trim());
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid promo code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showPromo && onApplyCoupon ? (
        <div className="space-y-2 border-b border-border pb-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter Promo Code"
              autoCapitalize="characters"
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm uppercase text-white outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "…" : "Apply"}
            </button>
          </form>
          {error ? <p className="text-xs text-[#ff8f8f]">{error}</p> : null}
          {couponCode ? (
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Remove {couponCode}
            </button>
          ) : null}
        </div>
      ) : null}

      <dl className="space-y-3 text-base">
        <div className="flex items-center justify-between">
          <dt className="text-white/70">Subtotal</dt>
          <dd className="text-white">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-white/70">Shipping</dt>
          <dd className={totals.shipping > 0 ? "text-white" : "font-semibold text-primary"}>
            {totals.shipping > 0 ? formatPrice(totals.shipping) : "FREE"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-white/70">Discount</dt>
          <dd
            className={
              totals.discountTotal > 0 ? "font-semibold text-primary" : "text-white"
            }
          >
            {totals.discountTotal > 0
              ? `-${formatPrice(totals.discountTotal)}`
              : formatPrice(0)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <dt className="font-semibold text-white">Total Amount</dt>
          <dd className="text-lg font-bold text-primary">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {totals.subtotal > 0 && totals.subtotal < 100 ? (
        <p className="text-xs text-white/50">
          Add {formatPrice(100 - totals.subtotal)} more for free shipping.
        </p>
      ) : null}
    </div>
  );
}

export { computeCartTotals };
