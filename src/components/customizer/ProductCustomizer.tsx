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
 *
 * Visually it is treated as an instrument rather than a page: dark chrome
 * wrapped around a bright proofing stage, the way a print shop's artwork
 * approval looks. Green is spent in exactly three places - the active
 * placement, the print-area guide and the primary action - so the eye can find
 * the thing that matters. Everything else is a hairline.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Konva touches the DOM on import, so the canvas is client-only.
const ProductCanvas = dynamic(() => import("@/components/customizer/ProductCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[576/240] w-full items-center justify-center bg-stage font-inter text-sm text-black/40">
      Loading preview…
    </div>
  ),
});

/**
 * One stage of the rail. The customizer really is a sequence - placement and
 * positioning are inert until artwork exists - so the numbering carries the
 * gating rather than decorating it, and a locked step says what unlocks it.
 */
function Step({
  index,
  title,
  locked,
  lockedHint,
  children,
}: {
  index: number;
  title: string;
  locked?: boolean;
  lockedHint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mt-6 border-t border-hairline pt-6 first:mt-0 first:border-t-0 first:pt-0"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-inter text-[11px] font-semibold tabular-nums ${
            locked ? "bg-white/[0.06] text-white/35" : "bg-white/10 text-white"
          }`}
        >
          {index}
        </span>
        <h3
          className={`font-inter text-[11px] font-semibold uppercase tracking-[0.14em] ${
            locked ? "text-white/35" : "text-white/80"
          }`}
        >
          {title}
        </h3>
      </div>

      <div className="mt-4">
        {locked ? (
          <p className="font-inter text-[13px] text-white/40">{lockedHint}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

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

  // Single-area products skip the placement step, so the rail numbers itself.
  const hasPlacementStep = customizer.printAreas.length > 1;
  const positionStepIndex = hasPlacementStep ? 3 : 2;

  return (
    <div className={`fixed inset-0 z-70 ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex justify-center md:p-5 lg:p-8">
        <div
          ref={panelRef}
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          aria-label={`Customize ${product.name}`}
          className={`pointer-events-auto flex h-full w-full max-w-[1360px] flex-col overflow-hidden bg-background shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)] transition-[opacity,transform,visibility] duration-300 md:rounded-2xl md:border md:border-hairline ${
            open ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
          }`}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-4 md:px-6">
            <div className="min-w-0">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Design proof
              </p>
              <h2 className="mt-1 truncate font-halyard-black text-lg leading-tight text-white md:text-[22px]">
                {product.name}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close customizer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_384px] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
            {/* Proofing stage */}
            <section
              aria-label="Product preview"
              className="op-scroll flex min-w-0 flex-col p-5 md:p-6 lg:min-h-0 lg:max-h-full lg:overflow-y-auto"
            >
              <div className="overflow-hidden rounded-xl border border-hairline bg-panel lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                <div
                  className="min-h-[140px] lg:min-h-[160px] lg:flex-1"
                  style={{ aspectRatio: `${config.baseWidth} / ${config.baseHeight}` }}
                >
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
                </div>

                <CustomizerToolbar
                  zoom={zoom}
                  printArea={customizer.activePrintArea}
                  transform={customizer.transform}
                  sizePercent={customizer.sizePercent}
                  hasDesign={customizer.hasDesign}
                  isExporting={isExporting}
                  onZoomChange={setZoom}
                  onReset={customizer.resetDesign}
                  onRemove={customizer.removeLogo}
                  onDownload={handleDownload}
                />
              </div>

              <p
                className="mt-3 shrink-0 font-inter text-[13px] leading-relaxed text-white/50"
                aria-live="polite"
              >
                {customizer.hasDesign
                  ? `Drag the logo to move it, or use the corner handles to resize and rotate. It stays inside the ${customizer.activePrintArea.name.toLowerCase()} print area.`
                  : "Upload your logo to start customizing."}
              </p>

              {exportError && (
                <p role="alert" className="mt-2 shrink-0 font-inter text-[13px] text-[#ff7a7a]">
                  {exportError}
                </p>
              )}
            </section>

            {/* Control rail */}
            <section
              aria-label="Customization controls"
              className="op-scroll flex min-w-0 flex-col border-hairline bg-panel p-5 md:p-6 lg:min-h-0 lg:border-l lg:overflow-y-auto"
            >
              <Step index={1} title="Artwork">
                <LogoUploader
                  logo={customizer.logo}
                  isUploading={customizer.isUploading}
                  error={customizer.error}
                  accept={config.allowedFileTypes}
                  maxFileSizeMB={config.maxFileSizeMB}
                  onSelect={customizer.uploadLogo}
                  onRemove={customizer.removeLogo}
                />
              </Step>

              {hasPlacementStep && (
                <Step index={2} title="Placement">
                  <PrintAreaSelector
                    printAreas={customizer.printAreas}
                    activeId={customizer.activePrintArea.id}
                    onSelect={customizer.selectPrintArea}
                  />
                </Step>
              )}

              <Step
                index={positionStepIndex}
                title="Size & position"
                locked={!customizer.transform}
                lockedHint="Add your artwork to unlock size, rotation and position."
              >
                {customizer.transform && (
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
                )}
              </Step>
            </section>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-3 border-t border-hairline px-5 py-4 md:px-6">
            <button
              type="button"
              onClick={handleApply}
              disabled={!customizer.hasDesign}
              className="rounded-lg bg-primary px-7 py-3 font-inter text-[15px] font-semibold text-primary-foreground transition-colors duration-200 hover:bg-[#00c244] disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-white/35"
            >
              Apply customization
            </button>
            <button
              type="button"
              onClick={customizer.resetDesign}
              disabled={!customizer.hasDesign}
              className="rounded-lg border border-hairline px-5 py-3 font-inter text-[15px] text-white/80 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:border-hairline disabled:text-white/30 disabled:hover:bg-transparent"
            >
              Start over
            </button>
            <p className="font-inter text-[13px] text-white/40 sm:ml-auto">
              Your logo stays on this device until you place your order.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
