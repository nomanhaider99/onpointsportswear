"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { X } from "lucide-react";
import type { ResolvedCustomizerConfig } from "@/data/customizer";
import type { Product } from "@/data/products";
import { useProductCustomizer } from "@/hooks/useProductCustomizer";
import type { ProductCustomization } from "@/lib/customization";
import { CustomizerToolbar, MIN_ZOOM } from "@/components/customizer/CustomizerToolbar";
import { LogoControls } from "@/components/customizer/LogoControls";
import { LogoUploader } from "@/components/customizer/LogoUploader";
import { PrintAreaSelector } from "@/components/customizer/PrintAreaSelector";

/**
 * The customizer dialog.
 *
 * Presented as a modal over the product page so the existing page markup is
 * untouched, and built from the same focus-trap / escape / scroll-lock pattern
 * the cart drawer already uses.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Konva touches the DOM on import, so the canvas is client-only.
const ProductCanvas = dynamic(() => import("@/components/customizer/ProductCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[576/240] w-full items-center justify-center rounded-lg bg-white/[0.03] text-sm text-white/60">
      Loading preview…
    </div>
  ),
});

export function ProductCustomizer({
  product,
  config,
  open,
  onClose,
  onApply,
}: {
  product: Product;
  config: ResolvedCustomizerConfig;
  open: boolean;
  onClose: () => void;
  onApply: (customization: ProductCustomization) => void;
}) {
  const customizer = useProductCustomizer(product, config);
  const stageRef = useRef<Konva.Stage | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { setError } = customizer;

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

  /**
   * Exports the stage at roughly twice the design resolution. The transformer
   * handles are detached first so the download shows the design, not the
   * editing chrome.
   */
  const handleDownload = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsExporting(true);
    setExportError(null);

    const transformers = stage.find("Transformer") as Konva.Transformer[];
    const attached = transformers.map((transformer) => transformer.nodes());

    try {
      transformers.forEach((transformer) => transformer.nodes([]));
      stage.draw();

      const dataUrl = stage.toDataURL({
        mimeType: "image/png",
        pixelRatio: 2 / (stage.scaleX() || 1),
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${product.slug}-custom-preview.png`;
      link.click();
    } catch {
      setExportError("The preview could not be exported in this browser.");
    } finally {
      transformers.forEach((transformer, index) => transformer.nodes(attached[index]));
      stage.draw();
      setIsExporting(false);
    }
  }, [product.slug]);

  const handleApply = useCallback(() => {
    const customization = customizer.serialize();
    if (!customization) {
      setError("Upload a logo before applying your customization.");
      return;
    }
    onApply(customization);
  }, [customizer, onApply, setError]);

  return (
    <div className={`fixed inset-0 z-70 ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={`Customize ${product.name}`}
        className={`absolute inset-0 flex flex-col bg-background transition-[opacity,transform,visibility] duration-300 md:inset-4 md:rounded-xl md:border md:border-border md:shadow-2xl ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Customize
            </p>
            <h2 className="truncate text-lg font-medium text-white md:text-xl">{product.name}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close customizer"
            className="rounded p-1.5 text-white transition-colors hover:text-primary"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* Preview */}
          <section aria-label="Product preview" className="min-w-0">
            <ProductCanvas
              config={config}
              printArea={customizer.activePrintArea}
              logoUrl={customizer.logo?.previewUrl ?? null}
              aspectRatio={customizer.logo?.aspectRatio ?? 1}
              transform={customizer.transform}
              isSelected={customizer.isSelected}
              zoom={zoom}
              productName={product.name}
              stageRef={stageRef}
              onSelect={customizer.setIsSelected}
              onTransformChange={(next) =>
                customizer.updateTransform(() => next)
              }
              onNudge={customizer.nudge}
            />

            <p className="mt-3 text-sm text-white/70" aria-live="polite">
              {customizer.hasDesign
                ? `Drag the logo to move it, or use the corner handles to resize and rotate. It stays inside the ${customizer.activePrintArea.name.toLowerCase()} print area.`
                : "Upload your logo to start customizing."}
            </p>

            <CustomizerToolbar
              zoom={zoom}
              hasDesign={customizer.hasDesign}
              isExporting={isExporting}
              onZoomChange={setZoom}
              onReset={customizer.resetDesign}
              onRemove={customizer.removeLogo}
              onDownload={handleDownload}
            />

            {exportError && (
              <p role="alert" className="mt-2 text-sm text-[#ff6b6b]">
                {exportError}
              </p>
            )}
          </section>

          {/* Controls */}
          <section
            aria-label="Customization controls"
            className="flex min-w-0 flex-col gap-6 rounded-xl border border-border bg-card p-5"
          >
            <LogoUploader
              logo={customizer.logo}
              isUploading={customizer.isUploading}
              error={customizer.error}
              accept={config.allowedFileTypes}
              maxFileSizeMB={config.maxFileSizeMB}
              onSelect={customizer.uploadLogo}
              onRemove={customizer.removeLogo}
            />

            <PrintAreaSelector
              printAreas={customizer.printAreas}
              activeId={customizer.activePrintArea.id}
              placedIds={Object.keys(customizer.placements)}
              onSelect={customizer.selectPrintArea}
            />

            {customizer.transform ? (
              <LogoControls
                transform={customizer.transform}
                printArea={customizer.activePrintArea}
                sizePercent={customizer.sizePercent}
                onSizeChange={customizer.setSize}
                onRotationChange={customizer.setRotation}
                onNudge={customizer.nudge}
                onCenterX={customizer.centerX}
                onCenterY={customizer.centerY}
              />
            ) : (
              <p className="rounded-lg border border-dashed border-[var(--color-primary-line)] p-4 text-sm text-white/60">
                Size, rotation and position controls appear here once your logo is uploaded.
              </p>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={handleApply}
            disabled={!customizer.hasDesign}
            className="rounded-lg bg-primary px-8 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-primary"
          >
            Apply Customization
          </button>
          <button
            type="button"
            onClick={customizer.resetDesign}
            disabled={!customizer.hasDesign}
            className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            Reset Design
          </button>
          <p className="text-sm text-white/60 sm:ml-auto">
            Your logo stays on this device until you place your order.
          </p>
        </footer>
      </div>
    </div>
  );
}
