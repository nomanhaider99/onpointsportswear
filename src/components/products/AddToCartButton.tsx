"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { jerseyStudioHref } from "@/lib/jersey-studio";

/**
 * Archive-card add-to-cart. The source adds the default (smallest) variation
 * straight from the grid; size selection lives on the product detail page.
 *
 * A customizable product opens the jersey studio instead of adding from the grid.
 */

const buttonClass =
  "self-start rounded-md border border-[var(--color-primary-line)] px-5 py-2.5 font-[family-name:var(--font-inter)] text-xs font-bold uppercase text-primary transition-colors duration-300 hover:bg-black hover:text-white";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  if (product.customizable) {
    return (
      <Link href={jerseyStudioHref(product)} className={buttonClass}>
        Customize
        <span className="sr-only"> {product.name}</span>
      </Link>
    );
  }

  function onClick() {
    const result = addItem(product, product.sizes[0].label, 1);
    if (!result.ok) {
      setError(result.reason ?? "This product could not be added to your cart.");
      return;
    }
    setError("");
    setAdded(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={onClick} className={buttonClass}>
        {added ? "Added" : "Add to cart"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[#ffb95e]">
          {error}
        </p>
      )}
      <span aria-live="polite" className="sr-only">
        {added ? `${product.name} added to cart` : ""}
      </span>
    </div>
  );
}
