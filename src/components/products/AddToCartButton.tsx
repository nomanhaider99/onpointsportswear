"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";

/**
 * Archive-card add-to-cart. The source adds the default (smallest) variation
 * straight from the grid; size selection lives on the product detail page.
 */
export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function onClick() {
    addItem(product, product.sizes[0].label, 1);
    setAdded(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="self-start rounded-md border border-[var(--color-primary-line)] px-5 py-2.5 font-[family-name:var(--font-inter)] text-xs font-bold uppercase text-primary transition-colors duration-300 hover:bg-black hover:text-white"
      >
        {added ? "Added" : "Add to cart"}
      </button>
      <span aria-live="polite" className="sr-only">
        {added ? `${product.name} added to cart` : ""}
      </span>
    </>
  );
}
