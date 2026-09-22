"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cartItemCompareAt, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { fetchShopCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/** Order summary panel, shown alongside every checkout step. */
export function OrderSummary({
  items,
  subtotal,
  editable = true,
}: {
  items: CartItem[];
  subtotal: number;
  /** The confirmation step shows the same lines without a link back to the cart. */
  editable?: boolean;
}) {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((state) => state.catalog.products);
  const bySlug = useAppSelector((state) => state.catalog.bySlug);

  useEffect(() => {
    if (!catalog.length) void dispatch(fetchShopCatalog());
  }, [catalog.length, dispatch]);

  const listedOriginal = (slug: string) =>
    catalog.find((product) => product.slug === slug)?.originalPrice ?? bySlug[slug]?.originalPrice;

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => {
    const compare = cartItemCompareAt(item, listedOriginal(item.slug));
    return sum + (compare || item.price) * item.quantity;
  }, 0);
  const discount = Math.max(0, originalTotal - subtotal);

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
          const compare = cartItemCompareAt(item, listedOriginal(item.slug));
          return (
            <li key={item.key} className="flex gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                <span className="absolute right-0 top-0 min-w-5 rounded-bl-md bg-primary px-1 text-center text-xs font-bold text-primary-foreground">
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

      <dl className="mt-5 space-y-3 border-t border-border pt-4 text-base">
        <div className="flex items-center justify-between">
          <dt className="text-white/70">Items</dt>
          <dd className="text-white">{itemCount}</dd>
        </div>
        {discount > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Original</dt>
              <dd className="text-white/60 line-through">{formatPrice(originalTotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Discount</dt>
              <dd className="font-semibold text-primary">-{formatPrice(discount)}</dd>
            </div>
          </>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-white/70">Subtotal</dt>
          <dd className="text-lg font-semibold text-primary">{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-white/60">
        Taxes and shipping are confirmed when we quote your team order. No payment is taken
        now.
      </p>
    </aside>
  );
}
