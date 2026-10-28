"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { CustomizeStudioButton } from "@/components/customizer/CustomizeStudioButton";
import { getAddToCartIssue, useCart } from "@/lib/cart";
import { resolveSizeChart, type SizeChartInfo } from "@/lib/api/sizeChart";
import { usesJerseyStudio } from "@/lib/jersey-studio";
import { notify } from "@/lib/notify";
import { formatPrice } from "@/lib/utils";
import {
  DEFAULT_PRODUCT_SIZE,
  groupSelectedSizes,
  shortSizeLabel,
} from "@/data/productSizes";

function embeddedSizeChart(chart: Product["sizeChart"]): SizeChartInfo | null {
  if (!chart?.image) return null;
  return {
    title: chart.title || "Size guide",
    description: chart.description || "",
    image: chart.image,
  };
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeChart, setSizeChart] = useState<SizeChartInfo | null>(() =>
    embeddedSizeChart(product.sizeChart),
  );
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openStudio = usesJerseyStudio(product);
  const sizeLabels = useMemo(() => product.sizes.map((entry) => entry.label), [product.sizes]);
  const sizeGroups = useMemo(() => groupSelectedSizes(sizeLabels), [sizeLabels]);
  const ungroupedSizes = useMemo(() => {
    const grouped = new Set(sizeGroups.flatMap((group) => group.selected));
    return product.sizes.filter((entry) => !grouped.has(entry.label));
  }, [product.sizes, sizeGroups]);

  useEffect(() => {
    const preferred =
      product.sizes.find((entry) => entry.label === DEFAULT_PRODUCT_SIZE)?.label ||
      product.sizes[0]?.label ||
      "";
    setSize(preferred);
    setError("");
    setSizeGuideOpen(false);
    setSizeChart(embeddedSizeChart(product.sizeChart));
  }, [product.id, product.sizes, product.sizeChart]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const chart = await resolveSizeChart({
        productId: product.id,
        categoryId: product.categoryId,
        categoryName: product.category,
        productName: product.name,
        embedded: product.sizeChart,
      });
      if (!cancelled) setSizeChart(chart);
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id, product.categoryId, product.category, product.name, product.sizeChart]);

  useEffect(() => {
    if (!sizeGuideOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSizeGuideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sizeGuideOpen]);

  const blockedReason = getAddToCartIssue(product, items, false);

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

    // Blank catalog order (no studio design) — customizer remains optional.
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

        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-3 rounded-lg bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xl font-medium text-white">Size</p>
              {sizeChart ? (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Size guide
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Size">
              {sizeGroups.map((group) => {
                const groupHasSelection = group.selected.includes(size);
                return (
                  <label key={group.id} className="relative flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                      {group.label}
                    </span>
                    <select
                      value={groupHasSelection ? size : ""}
                      aria-label={`${group.label} size`}
                      onChange={(event) => {
                        const next = event.target.value;
                        if (!next) return;
                        setSize(next);
                        setError("");
                      }}
                      className="w-full appearance-none rounded-lg border border-white/20 bg-[#0f1218] px-4 py-2.5 pr-10 text-base font-semibold text-white outline-none transition-colors focus:border-primary"
                    >
                      <option value="">{`Select ${group.label.toLowerCase()} size`}</option>
                      {group.selected.map((code) => (
                        <option key={code} value={code}>
                          {shortSizeLabel(code)}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 bottom-[14px] text-white/45"
                    >
                      ▾
                    </span>
                  </label>
                );
              })}
              {ungroupedSizes.length ? (
                <label className="relative flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Other
                  </span>
                  <select
                    value={ungroupedSizes.some((entry) => entry.label === size) ? size : ""}
                    aria-label="Other size"
                    onChange={(event) => {
                      const next = event.target.value;
                      if (!next) return;
                      setSize(next);
                      setError("");
                    }}
                    className="w-full appearance-none rounded-lg border border-white/20 bg-[#0f1218] px-4 py-2.5 pr-10 text-base font-semibold text-white outline-none transition-colors focus:border-primary"
                  >
                    <option value="">Select size</option>
                    {ungroupedSizes.map((entry) => (
                      <option key={entry.label} value={entry.label}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 bottom-[14px] text-white/45"
                  >
                    ▾
                  </span>
                </label>
              ) : null}
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
            {openStudio ? (
              <CustomizeStudioButton
                product={product}
                size={size}
                className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-[5px] text-base leading-8 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Customize
              </CustomizeStudioButton>
            ) : null}
            {blockedReason && (
              <p id="add-blocked" className="w-full text-sm text-[#ffb95e]">
                {blockedReason}
              </p>
            )}
            <span aria-live="polite" className={added ? "text-sm text-primary" : "sr-only"}>
              {added ? "Added to cart" : ""}
            </span>
            {openStudio ? (
              <p className="w-full text-sm text-white/55">
                Add to cart for a blank order, or Customize to design first (sign in required).
              </p>
            ) : null}
          </div>
        </form>
      </div>

      {sizeGuideOpen && sizeChart ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
          role="presentation"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl border border-white/15 bg-[#0f1218] p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="size-guide-title" className="text-xl font-semibold text-white">
                  {sizeChart.title || "Size guide"}
                </h2>
                {sizeChart.description ? (
                  <p className="mt-1 text-sm text-white/65">{sizeChart.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Close size guide"
                onClick={() => setSizeGuideOpen(false)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:border-primary"
              >
                Close
              </button>
            </div>
            <div className="relative mx-auto min-h-[200px] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sizeChart.image}
                alt={sizeChart.title || "Size guide"}
                className="mx-auto h-auto max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
