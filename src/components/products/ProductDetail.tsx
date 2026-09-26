"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { CustomizeStudioButton } from "@/components/customizer/CustomizeStudioButton";
import { getAddToCartIssue, useCart } from "@/lib/cart";
import { usesJerseyStudio } from "@/lib/jersey-studio";
import { notify } from "@/lib/notify";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openStudio = usesJerseyStudio(product);

  useEffect(() => {
    setSize(product.sizes[0]?.label || "");
    setError("");
  }, [product.id]);

  const blockedReason = openStudio
    ? "Open the customizer to design and add this product to your cart."
    : getAddToCartIssue(product, items, false);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const selected = product.sizes.find((entry) => entry.label === size);
  const unitPrice = selected?.price ?? product.priceMin;
  const showRange = !selected && product.priceMin !== product.priceMax;
  const priceLabel = showRange
    ? `${formatPrice(product.priceMin)} – ${formatPrice(product.priceMax)}`
    : formatPrice(unitPrice);
  const compareAt = product.originalPrice && product.originalPrice > unitPrice ? product.originalPrice : 0;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (openStudio) {
      notify.info("Use Customize to design and add this item.");
      return;
    }
    if (blockedReason) {
      notify.error(blockedReason);
      setError(blockedReason);
      return;
    }
    if (!size) {
      notify.error("Please select a size before adding to cart.");
      setError("Please select a size before adding to cart.");
      return;
    }
    setError("");

    const result = addItem(product, size, quantity);
    if (!result.ok) {
      setError(result.reason ?? "This product could not be added to your cart.");
      return;
    }

    setAdded(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="relative h-[320px] overflow-hidden rounded-lg bg-card sm:h-[380px] lg:h-[420px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 48vw"
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-col gap-[25px]">
        <h1 className="text-[28px] font-medium leading-tight text-white md:text-4xl">
          {product.name}
        </h1>
        <p className="text-[30px] font-extrabold text-primary">
          {compareAt > 0 ? (
            <>
              <span className="mr-3 text-lg font-medium text-white/45 line-through">
                {formatPrice(compareAt)}
              </span>
              <span aria-hidden="true">{priceLabel}</span>
            </>
          ) : (
            <span aria-hidden="true">{priceLabel}</span>
          )}
        </p>

        {openStudio ? (
          <div className="rounded-lg border border-[var(--color-primary-line)] bg-primary-soft p-5">
            <p className="text-base font-medium text-white">Product customizer</p>
            <p className="mt-1 text-sm text-white/70">
              Sign in first (same as the app), then design colors, patterns, logos, names, and socks.
            </p>
            <CustomizeStudioButton
              product={product}
              size={size}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#029b36]"
            />
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-3 rounded-lg bg-white/[0.04] p-5">
            <p className="text-xl font-medium text-white">Size</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
              {product.sizes.map((entry) => {
                const active = entry.label === size;
                return (
                  <button
                    key={entry.label}
                    type="button"
                    onClick={() => {
                      setSize(entry.label);
                      setError("");
                    }}
                    className={`min-w-12 rounded-lg border px-4 py-2.5 text-base font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/20 bg-transparent text-white hover:border-primary"
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p id="size-error" role="alert" className="mt-3 text-sm text-[#ff6b6b]">
              {error}
            </p>
          )}

          {!openStudio ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={1}
                value={quantity}
                aria-label={`${product.name} quantity`}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);
                  setQuantity(Number.isNaN(next) || next < 1 ? 1 : next);
                }}
                className="w-16 rounded-lg border border-primary bg-transparent py-2 text-center text-base text-white"
              />
              <button
                type="submit"
                disabled={Boolean(blockedReason)}
                aria-describedby={blockedReason ? "add-blocked" : undefined}
                className="rounded-lg bg-primary px-[50px] py-[5px] text-base leading-8 text-primary-foreground transition-all duration-200 hover:bg-[#029b36] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-primary"
              >
                Add to cart
              </button>
              {blockedReason && (
                <p id="add-blocked" className="w-full text-sm text-[#ffb95e]">
                  {blockedReason}
                </p>
              )}
              <span aria-live="polite" className={added ? "text-sm text-primary" : "sr-only"}>
                {added ? "Added to cart" : ""}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">
              Pick a size, then open Customize. You must be signed in — designs save to your account.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
