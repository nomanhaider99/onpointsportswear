"use client";

import { Download, RotateCcw, Trash2, ZoomIn, ZoomOut } from "lucide-react";

/** Zoom + destructive actions that sit under the preview on every breakpoint. */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export function CustomizerToolbar({
  zoom,
  hasDesign,
  isExporting,
  onZoomChange,
  onReset,
  onRemove,
  onDownload,
}: {
  zoom: number;
  hasDesign: boolean;
  isExporting: boolean;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const buttonClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-line)] px-3 py-2 text-sm text-white transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-white";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-primary-line)] p-1">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="flex h-10 w-10 items-center justify-center rounded text-white transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ZoomOut size={16} aria-hidden="true" />
        </button>
        <span className="min-w-12 text-center text-sm tabular-nums text-white/80" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="flex h-10 w-10 items-center justify-center rounded text-white transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ZoomIn size={16} aria-hidden="true" />
        </button>
      </div>

      <button type="button" onClick={onReset} disabled={!hasDesign} className={buttonClass}>
        <RotateCcw size={15} aria-hidden="true" />
        Reset Design
      </button>

      <button type="button" onClick={onRemove} disabled={!hasDesign} className={buttonClass}>
        <Trash2 size={15} aria-hidden="true" />
        Remove Logo
      </button>

      <button
        type="button"
        onClick={onDownload}
        disabled={!hasDesign || isExporting}
        className={`${buttonClass} ml-auto`}
      >
        <Download size={15} aria-hidden="true" />
        {isExporting ? "Preparing…" : "Download Preview"}
      </button>
    </div>
  );
}
