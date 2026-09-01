"use client";

import { Download, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { PrintArea } from "@/data/customizer";
import type { LogoTransform } from "@/lib/customizer-geometry";

/**
 * The proof bar: the strip fused to the bottom of the stage.
 *
 * It carries zoom on the left, a live readout of the design in the middle and
 * the stage actions on the right - the same anatomy a print shop's proof sheet
 * or a design tool's status bar uses. Every number is tabular so the row does
 * not twitch while the customer drags the logo, and the readout is duplicated
 * for screen readers as a labelled description list.
 */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:text-white/20 disabled:hover:bg-transparent";

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
        {label}
      </dt>
      <dd className="font-inter text-[12px] tabular-nums text-white/85">{value}</dd>
    </div>
  );
}

export function CustomizerToolbar({
  zoom,
  printArea,
  transform,
  sizePercent,
  hasDesign,
  isExporting,
  onZoomChange,
  onReset,
  onRemove,
  onDownload,
}: {
  zoom: number;
  printArea: PrintArea;
  transform: LogoTransform | null;
  sizePercent: number;
  hasDesign: boolean;
  isExporting: boolean;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  onRemove: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline bg-panel px-3 py-2.5">
      {/* Zoom */}
      <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.05] p-0.5">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={iconButton}
        >
          <Minus size={15} aria-hidden="true" />
        </button>
        <span
          className="min-w-11 text-center font-inter text-[12px] tabular-nums text-white/85"
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={iconButton}
        >
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Live spec */}
      <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-hairline pl-1 sm:border-l sm:pl-4">
        <Readout label="Area" value={printArea.name} />
        {transform ? (
          <>
            <Readout label="Scale" value={`${Math.round(sizePercent)}%`} />
            <Readout
              label="Offset"
              value={`${Math.round(transform.x - printArea.x)}, ${Math.round(
                transform.y - printArea.y,
              )}`}
            />
            <Readout label="Angle" value={`${Math.round(transform.rotation)}°`} />
          </>
        ) : (
          <div className="font-inter text-[12px] text-white/35">No artwork yet</div>
        )}
      </dl>

      {/* Stage actions */}
      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasDesign}
          aria-label="Reset the design to its starting position"
          title="Reset design"
          className={iconButton}
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={!hasDesign}
          aria-label="Remove the uploaded logo"
          title="Remove logo"
          className={iconButton}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasDesign || isExporting}
          aria-label="Download a PNG of this preview"
          title="Download preview"
          className={`${iconButton} w-auto gap-1.5 px-2.5 font-inter text-[12px]`}
        >
          <Download size={15} aria-hidden="true" />
          {isExporting ? "Preparing…" : "Preview"}
        </button>
      </div>
    </div>
  );
}
