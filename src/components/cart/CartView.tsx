"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItemThumb } from "@/components/cart/CartItemThumb";
import { CartTotalsBreakdown } from "@/components/cart/CartTotalsBreakdown";
import { cartItemCompareAt, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { fetchShopCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function CartView() {
  const {
    items,
    totals,
    couponCode,
    applyCoupon,
    removeCoupon,
    removeItem,
    incrementItem,
    decrementItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((state) => state.catalog.products);

  useEffect(() => {
    if (!catalog.length) void dispatch(fetchShopCatalog());
  }, [catalog.length, dispatch]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-lg text-white">Your cart is currently empty.</p>
        <p className="mt-2 text-base text-white/70">
          Browse our pro-grade gear and add something to get started.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
        >
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-24 sm:w-24"
              >
                <CartItemThumb
                  item={item}
                  catalogImage={catalog.find((product) => product.slug === item.slug)?.image}
                  sizes="120px"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-lg font-semibold text-secondary transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-white/70">Size: {item.size}</p>
                {item.customization && (
                  <p className="mt-1 text-sm text-primary">
                    Custom logo: {item.customization.logoFileName ?? "uploaded artwork"} ·{" "}
                    {item.customization.printAreaName}
                  </p>
                )}
                <p className="mt-1 text-sm text-white/70">
                  {(() => {
                    const compare = cartItemCompareAt(
                      item,
                      catalog.find((product) => product.slug === item.slug)?.originalPrice,
                    );
                    return compare > 0 ? (
                      <>
                        <span className="mr-2 text-white/45 line-through">{formatPrice(compare)}</span>
                        {formatPrice(item.price)} each
                      </>
                    ) : (
                      <>{formatPrice(item.price)} each</>
                    );
                  })()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-primary">
                  <button
                    type="button"
                    onClick={() => decrementItem(item.key)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="px-3 py-2 text-white transition-colors hover:text-primary"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    aria-label={`Quantity of ${item.name}`}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      updateQuantity(item.key, Number.isNaN(next) ? 0 : next);
                    }}
                    className="w-14 border-x border-primary bg-transparent py-2 text-center text-base text-white [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => incrementItem(item.key)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="px-3 py-2 text-white transition-colors hover:text-primary"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>

                <p className="min-w-20 text-right text-lg font-semibold text-primary">
                  {(() => {
                    const compare = cartItemCompareAt(
                      item,
                      catalog.find((product) => product.slug === item.slug)?.originalPrice,
                    );
                    return (
                      <>
                        {compare > 0 ? (
                          <span className="mb-0.5 block text-sm font-normal text-white/45 line-through">
                            {formatPrice(compare * item.quantity)}
                          </span>
                        ) : null}
                        {formatPrice(item.price * item.quantity)}
                      </>
                    );
                  })()}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="rounded p-2 text-white/60 transition-colors hover:text-primary"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => clearCart()}
          className="mt-5 rounded-lg border border-primary px-5 py-2.5 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          Clear Cart
        </button>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold uppercase text-white">Cart Totals</h2>
        <div className="mt-5">
          <CartTotalsBreakdown
            totals={totals}
            couponCode={couponCode}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
            showPromo
          />
        </div>
        <Link
          href="/checkout"
          className="mt-6 flex justify-center rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/contact"
          className="mt-3 flex justify-center rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          Request a Quote
        </Link>
        <Link
          href="/products"
          className="mt-3 flex justify-center rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
