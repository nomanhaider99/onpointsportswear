"use client";

import { useEffect, useMemo, useState } from "react";
import {
  productCategories,
  productTypes,
  productTypeLabels,
  type Product,
  type ProductCategory,
  type ProductType,
} from "@/data/products";
import type { ApiCategory } from "@/lib/api/mapProduct";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/utils";
import { fetchShopCatalog, seedCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type CategoryFilter = "All" | ProductCategory | string;
type TypeFilter = "All" | ProductType;

const tabClass =
  "rounded-md border border-primary px-[15px] pb-[15px] pt-2.5 font-[family-name:var(--font-inter)] text-sm font-bold uppercase transition-colors duration-300";

export function ProductFilters({
  initialProducts = [],
  initialCategories = [],
  initialError = "",
}: {
  initialProducts?: Product[];
  initialCategories?: ApiCategory[];
  initialError?: string;
}) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.catalog.products);
  const categories = useAppSelector((state) => state.catalog.categories);
  const loading = useAppSelector((state) => state.catalog.loading);
  const error = useAppSelector((state) => state.catalog.error);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [type, setType] = useState<TypeFilter>("All");

  useEffect(() => {
    if (initialProducts.length || initialCategories.length) {
      dispatch(
        seedCatalog({
          products: initialProducts,
          categories: initialCategories,
          error: initialError,
        }),
      );
    }
    // Always refresh from API in the browser as well.
    dispatch(fetchShopCatalog());
    // Seed once from SSR props; client refresh is separate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const list = products.length ? products : initialProducts;
  const cats = categories.length ? categories : initialCategories;
  const displayError = error || (list.length ? "" : initialError);

  const categoryTabs = useMemo(() => {
    const names = cats.map((item) => item.name).filter(Boolean);
    if (names.length) return ["All", ...names] as CategoryFilter[];
    return ["All", ...productCategories.filter((item) => item !== "All")] as CategoryFilter[];
  }, [cats]);

  const visible = useMemo(
    () =>
      list.filter((product) => {
        if (category !== "All") {
          const selected = String(category).trim().toLowerCase();
          const productCategory = String(product.category || "").trim().toLowerCase();
          if (productCategory !== selected) return false;
        }
        if (type === "customizable") return product.customizable;
        if (type === "standard") return !product.customizable;
        return true;
      }),
    [list, category, type],
  );

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2.5"
        role="tablist"
        aria-label="Product categories"
      >
        {categoryTabs.map((entry) => {
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
        {loading && list.length === 0
          ? "Loading products…"
          : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
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
            {loading
              ? "Loading products…"
              : displayError
                ? `Could not load products from the server. ${displayError}`
                : "No products match those filters."}
          </p>
        )}
      </div>
    </>
  );
}
