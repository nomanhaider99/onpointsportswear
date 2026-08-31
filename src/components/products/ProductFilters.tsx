"use client";

import { useMemo, useState } from "react";
import {
  products,
  productCategories,
  productTypes,
  productTypeLabels,
  type ProductCategory,
  type ProductType,
} from "@/data/products";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/utils";

type CategoryFilter = "All" | ProductCategory;
type TypeFilter = "All" | ProductType;

/**
 * Two independent filters: what the garment is, and whether it can carry a
 * custom logo. They combine, so "Jerseys + Customizable" is a valid view.
 */

const tabClass =
  "rounded-md border border-primary px-[15px] pb-[15px] pt-2.5 font-[family-name:var(--font-inter)] text-sm font-bold uppercase transition-colors duration-300";

export function ProductFilters() {
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [type, setType] = useState<TypeFilter>("All");

  const visible = useMemo(
    () =>
      products.filter((product) => {
        if (category !== "All" && product.category !== category) return false;
        if (type === "customizable") return product.customizable;
        if (type === "standard") return !product.customizable;
        return true;
      }),
    [category, type],
  );

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2.5"
        role="tablist"
        aria-label="Product categories"
      >
        {productCategories.map((entry) => {
          const selected = entry === category;
          return (
            <button
              key={entry}
              type="button"
              role="tab"
              id={`filter-${entry}`}
              aria-selected={selected}
              aria-controls="product-results"
              onClick={() => setCategory(entry)}
              className={cn(
                tabClass,
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-white hover:bg-primary/10",
              )}
            >
              {entry}
            </button>
          );
        })}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-2.5"
        role="tablist"
        aria-label="Product type"
      >
        {productTypes.map((entry) => {
          const selected = entry === type;
          const label = entry === "All" ? "All Types" : productTypeLabels[entry];
          return (
            <button
              key={entry}
              type="button"
              role="tab"
              id={`type-${entry}`}
              aria-selected={selected}
              aria-controls="product-results"
              onClick={() => setType(entry)}
              className={cn(
                tabClass,
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-white hover:bg-primary/10",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-white/60" aria-live="polite">
        {visible.length} {visible.length === 1 ? "product" : "products"}
        {type === "customizable" && " you can add your own logo to"}
        {type === "standard" && " sold as shown"}
      </p>

      <div
        id="product-results"
        role="tabpanel"
        aria-labelledby={`filter-${category}`}
        className="mt-6"
      >
        {visible.length > 0 ? (
          <ProductGrid products={visible} columns={2} />
        ) : (
          <p className="rounded-xl border border-border bg-card p-10 text-center text-base text-white">
            No products match those filters.
          </p>
        )}
      </div>
    </>
  );
}
