"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { cartItemCompareAt, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, totals, removeItem, incrementItem, decrementItem } = useCart();
  const catalog = useAppSelector((state) => state.catalog.products);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-60 ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-base font-semibold uppercase text-white">Your Cart</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded p-1 text-white transition-colors hover:text-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-base text-white">No products in the cart.</p>
            <Link
              href="/products"
              onClick={onClose}
              className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const compare = cartItemCompareAt(
                  item,
                  catalog.find((product) => product.slug === item.slug)?.originalPrice,
                );
                return (
                <li
                  key={item.key}
                  className="flex gap-3 border-b border-border py-4 last:border-b-0"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={onClose}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-card"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="block text-base text-white transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-white/70">Size: {item.size}</p>
                    {item.customization && (
                      <p className="mt-0.5 text-sm text-primary">
                        Custom logo · {item.customization.printAreaName}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-primary">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.key)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="px-2 py-1 text-white transition-colors hover:text-primary"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="min-w-6 text-center text-sm text-white" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementItem(item.key)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="px-2 py-1 text-white transition-colors hover:text-primary"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-right text-sm font-semibold text-primary">
                        {compare > 0 ? (
                          <span className="mb-0.5 block text-xs font-normal text-white/45 line-through">
                            {formatPrice(compare * item.quantity)}
                          </span>
                        ) : null}
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="ml-auto rounded p-1 text-white/60 transition-colors hover:text-primary"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
              })}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#dddddd]">Shipping</span>
                <span className={totals.shipping > 0 ? "text-white" : "font-semibold text-primary"}>
                  {totals.shipping > 0 ? formatPrice(totals.shipping) : "FREE"}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#dddddd]">Discount</span>
                <span
                  className={
                    totals.discountTotal > 0 ? "font-semibold text-primary" : "text-white"
                  }
                >
                  {totals.discountTotal > 0
                    ? `-${formatPrice(totals.discountTotal)}`
                    : formatPrice(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-[#dddddd]">Total</span>
                <span className="font-semibold text-primary">{formatPrice(totals.total)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="rounded-lg border border-primary px-4 py-3 text-center text-base text-white transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="rounded-lg bg-primary px-4 py-3 text-center text-base text-primary-foreground transition-colors hover:bg-[#029b36]"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
