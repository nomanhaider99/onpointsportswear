"use client";

import { useMemo, useState } from "react";
import { products, productCategories, type ProductCategory } from "@/data/products";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/utils";

type Filter = "All" | ProductCategory;

export function ProductFilters() {
  const [active, setActive] = useState<Filter>("All");

  const visible = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [active],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5" role="tablist" aria-label="Product categories">
        {productCategories.map((category) => {
          const selected = category === active;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              id={`filter-${category}`}
              aria-selected={selected}
              aria-controls="product-results"
              onClick={() => setActive(category)}
              className={cn(
                "rounded-md border border-primary px-[15px] pb-[15px] pt-2.5 font-[family-name:var(--font-inter)] text-sm font-bold uppercase transition-colors duration-300",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-white hover:bg-primary/10",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div
        id="product-results"
        role="tabpanel"
        aria-labelledby={`filter-${active}`}
        className="mt-10"
      >
        <ProductGrid products={visible} columns={2} />
      </div>
    </>
  );
}
