"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Pencil, Sparkles, X } from "lucide-react";
import type { ResolvedCustomizerConfig } from "@/data/customizer";
import type { Product } from "@/data/products";
import type { ProductCustomization } from "@/lib/customization";
import { ProductCustomizer } from "@/components/customizer/ProductCustomizer";

/**
 * Entry point for the customizer on the product page: the Customize button, the
 * applied-design summary, and the dialog itself.
 *
 * The dialog is only mounted after the first click, so the canvas bundle is
 * never downloaded by visitors who do not open it. Once mounted it stays
 * mounted, which is what lets a customer reopen it with their design intact.
 */

export function CustomizerLauncher({
  product,
  config,
  customization,
  onChange,
}: {
  product: Product;
  config: ResolvedCustomizerConfig;
  customization: ProductCustomization | null;
  onChange: (customization: ProductCustomization | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const openCustomizer = useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);

  const handleApply = useCallback(
    (applied: ProductCustomization) => {
      onChange(applied);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div className="rounded-lg border border-[var(--color-primary-line)] bg-primary-soft p-5">
      {customization ? (
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/10">
            {customization.logoPreviewUrl && (
              <Image
                src={customization.logoPreviewUrl}
                alt={`Your logo on the ${customization.printAreaName.toLowerCase()}`}
                fill
                unoptimized
                className="object-contain"
              />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-white">Customization applied</p>
            <p className="mt-0.5 truncate text-sm text-white/70">
              {customization.logoFileName} · {customization.printAreaName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCustomizer}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              <Pencil size={15} aria-hidden="true" />
              Edit design
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:text-primary"
            >
              <X size={15} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-base font-medium text-white">Add your own logo</p>
            <p className="mt-0.5 text-sm text-white/70">
              Upload artwork and preview it on this product before you order.
            </p>
          </div>
          <button
            type="button"
            onClick={openCustomizer}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
          >
            <Sparkles size={17} aria-hidden="true" />
            Customize This Product
          </button>
        </div>
      )}

      {hasOpened && (
        <ProductCustomizer
          product={product}
          config={config}
          open={open}
          onClose={() => setOpen(false)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
