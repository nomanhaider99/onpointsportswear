"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomizerLauncher } from "@/components/customizer/CustomizerLauncher";
import { getCustomizerConfig } from "@/data/customizer";
import type { Product } from "@/data/products";
import { getAddToCartIssue, useCart } from "@/lib/cart";
import { handleAddCustomizedProduct, type ProductCustomization } from "@/lib/customization";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [customization, setCustomization] = useState<ProductCustomization | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // null for products that are not customizable - the button stays hidden.
  const customizerConfig = useMemo(() => getCustomizerConfig(product), [product]);

  /**
   * Blocks checkout for a customizable product with no logo applied, and for a
   * product whose type does not match what is already in the cart.
   */
  const blockedReason = getAddToCartIssue(product, items, Boolean(customization));

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const selected = product.sizes.find((entry) => entry.label === size);
  const priceLabel = selected
    ? formatPrice(selected.price)
    : `${formatPrice(product.priceMin)} – ${formatPrice(product.priceMax)}`;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blockedReason) {
      setError(blockedReason);
      return;
    }
    if (!size) {
      setError("Please select a size before adding to cart.");
      return;
    }
    setError("");

    if (customization) {
      const variation = product.sizes.find((entry) => entry.label === size);
      const { summary } = handleAddCustomizedProduct({
        product,
        variant: variation ? { size: variation.label, price: variation.price } : undefined,
        customization,
        quantity,
      });
      const result = addItem(product, size, quantity, summary);
      if (!result.ok) {
        setError(result.reason ?? "This product could not be added to your cart.");
        return;
      }
    } else {
      const result = addItem(product, size, quantity);
      if (!result.ok) {
        setError(result.reason ?? "This product could not be added to your cart.");
        return;
      }
    }

    setAdded(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          width={720}
          height={400}
          priority
          sizes="(max-width: 1023px) 100vw, 48vw"
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-[25px]">
        <h1 className="text-[28px] font-medium leading-tight text-white md:text-4xl">
          {product.name}
        </h1>
        <p className="text-[30px] font-extrabold text-primary">
          <span className="sr-only">
            Price range {formatPrice(product.priceMin)} through {formatPrice(product.priceMax)}
          </span>
          <span aria-hidden="true">{priceLabel}</span>
        </p>

        {customizerConfig && (
          <CustomizerLauncher
            product={product}
            config={customizerConfig}
            customization={customization}
            onChange={setCustomization}
          />
        )}

        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-3 rounded-lg bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:gap-6">
            <label htmlFor="size" className="text-xl font-medium text-white sm:w-32 sm:shrink-0">
              Size
            </label>
            <div className="flex-1">
              <select
                id="size"
                name="size"
                value={size}
                onChange={(event) => {
                  setSize(event.target.value);
                  if (event.target.value) setError("");
                }}
                aria-describedby={error ? "size-error" : undefined}
                aria-invalid={error ? true : undefined}
                className="w-full rounded-lg border border-primary bg-transparent py-2.5 pl-2.5 pr-8 text-lg text-white"
              >
                <option value="" className="bg-background text-white">
                  Choose an option
                </option>
                {product.sizes.map((entry) => (
                  <option key={entry.label} value={entry.label} className="bg-background text-white">
                    {entry.label}
                  </option>
                ))}
              </select>
              {size && (
                <button
                  type="button"
                  onClick={() => setSize("")}
                  className="mt-2 text-sm text-white/70 underline transition-colors hover:text-primary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && (
            <p id="size-error" role="alert" className="mt-3 text-sm text-[#ff6b6b]">
              {error}
            </p>
          )}

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
              {added ? (customization ? "Added to cart with your logo" : "Added to cart") : ""}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
