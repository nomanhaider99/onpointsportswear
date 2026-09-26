"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CartItemThumb } from "@/components/cart/CartItemThumb";
import { CartTotalsBreakdown } from "@/components/cart/CartTotalsBreakdown";
import { cartItemCompareAt, useCart, type CartItem } from "@/lib/cart";
import { computeCartTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/utils";
import { fetchShopCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/** Order summary panel, shown alongside every checkout step. */
export function OrderSummary({
  items,
  editable = true,
}: {
  items: CartItem[];
  /** Kept for callers that still pass it; totals are computed from items + coupon. */
  subtotal?: number;
  editable?: boolean;
}) {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((state) => state.catalog.products);
  const bySlug = useAppSelector((state) => state.catalog.bySlug);
  const { couponCode, couponDiscount, applyCoupon, removeCoupon } = useCart();

  useEffect(() => {
    if (!catalog.length) void dispatch(fetchShopCatalog());
  }, [catalog.length, dispatch]);

  const catalogOriginalBySlug: Record<string, number | undefined> = {};
  for (const product of catalog) catalogOriginalBySlug[product.slug] = product.originalPrice;
  for (const [slug, product] of Object.entries(bySlug)) {
    if (catalogOriginalBySlug[slug] == null) catalogOriginalBySlug[slug] = product.originalPrice;
  }

  const totals = computeCartTotals({
    items,
    catalogOriginalBySlug,
    couponDiscount,
  });

  return (
    <aside className="h-fit rounded-xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold uppercase text-white">Order Summary</h2>
        {editable && (
          <Link
            href="/cart"
            className="text-sm text-white/70 underline transition-colors hover:text-primary"
          >
            Edit cart
          </Link>
        )}
      </div>

      <ul className="mt-5 space-y-4">
        {items.map((item) => {
          const compare = cartItemCompareAt(item, catalogOriginalBySlug[item.slug]);
          return (
            <li key={item.key} className="flex gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <CartItemThumb
                  item={item}
                  catalogImage={
                    catalog.find((product) => product.slug === item.slug)?.image ||
                    bySlug[item.slug]?.image
                  }
                  sizes="64px"
                />
                <span className="absolute right-0 top-0 z-10 min-w-5 rounded-bl-md bg-primary px-1 text-center text-xs font-bold text-primary-foreground">
                  {item.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base leading-snug text-white">{item.name}</span>
                <span className="mt-0.5 block text-sm text-white/70">Size: {item.size}</span>
                {item.customization && (
                  <span className="mt-0.5 block text-sm text-primary">
                    Custom logo · {item.customization.printAreaName}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                {compare > 0 ? (
                  <span className="block text-xs text-white/45 line-through">
                    {formatPrice(compare * item.quantity)}
                  </span>
                ) : null}
                <span className="block text-sm font-semibold text-primary">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <CartTotalsBreakdown
          totals={totals}
          couponCode={couponCode}
          onApplyCoupon={applyCoupon}
          onRemoveCoupon={removeCoupon}
          showPromo={editable}
        />
      </div>
    </aside>
  );
}
