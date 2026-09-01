"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Check, Trash2, Upload } from "lucide-react";
import type { UploadedLogo } from "@/lib/customization";

/**
 * Accessible file picker with drag-and-drop. The input stays a real
 * <input type="file"> behind a label so keyboard and screen-reader users get
 * the native control; the styled box is the label.
 *
 * Empty and filled are two different shapes rather than one shape with swapped
 * contents: an empty dropzone stacks its invitation vertically so nothing
 * truncates in the narrow rail, and a loaded file collapses to a compact
 * artwork row with the thumbnail read against a checkerboard, which is how a
 * customer verifies their transparency actually is transparent.
 */

const CHECKERBOARD =
  "repeating-conic-gradient(#ffffff1a 0% 25%, transparent 0% 50%) 50% / 12px 12px";

export function LogoUploader({
  logo,
  isUploading,
  error,
  accept,
  maxFileSizeMB,
  onSelect,
  onRemove,
}: {
  logo: UploadedLogo | null;
  isUploading: boolean;
  error: string | null;
  accept: string[];
  maxFileSizeMB: number;
  onSelect: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [isDragging, setIsDragging] = useState(false);

  const dropHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      onSelect(event.dataTransfer.files?.[0]);
    },
  };

  return (
    <div>
      {logo ? (
        <div className="rounded-xl border border-hairline bg-raised p-3">
          <div className="flex items-center gap-3">
            <span
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
              style={{ background: CHECKERBOARD }}
            >
              {/* Object URL of a local file - next/image cannot optimise it. */}
              <Image
                src={logo.previewUrl}
                alt={`Uploaded logo: ${logo.fileName}`}
                fill
                unoptimized
                className="object-contain"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate font-inter text-[14px] text-white" title={logo.fileName}>
                  {logo.fileName}
                </span>
              </span>
              <span className="mt-0.5 block font-inter text-[12px] tabular-nums text-white/45">
                {logo.naturalWidth} × {logo.naturalHeight} px
              </span>
            </span>
          </div>

          <div className="mt-3 flex gap-2 border-t border-hairline pt-3">
            <label
              htmlFor={inputId}
              {...dropHandlers}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-inter text-[13px] transition-colors ${
                isDragging
                  ? "border-primary bg-primary-soft text-white"
                  : "border-hairline text-white/80 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Upload size={14} aria-hidden="true" />
              Replace file
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-inter text-[13px] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Trash2 size={14} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          {...dropHandlers}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-7 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary-soft"
              : "border-white/15 bg-raised hover:border-white/30 hover:bg-white/[0.08]"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/70">
            <Upload size={19} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-inter text-[14px] font-medium text-white">
              Drop your logo here, or browse
            </span>
            <span className="mt-1 block font-inter text-[12px] text-white/45">
              PNG, JPG, WEBP or SVG · up to {maxFileSizeMB}MB
            </span>
          </span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={accept.join(",")}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="sr-only"
        onChange={(event) => {
          onSelect(event.target.files?.[0]);
          // Reset so re-picking the same file still fires a change event.
          event.target.value = "";
        }}
      />

      <p
        aria-live="polite"
        className={isUploading ? "mt-2 font-inter text-[13px] text-white/60" : "sr-only"}
      >
        {isUploading ? "Loading your logo…" : ""}
      </p>

      {error && (
        <p id={errorId} role="alert" className="mt-2 font-inter text-[13px] text-[#ff7a7a]">
          {error}
        </p>
      )}

      {!logo && !error && (
        <p className="mt-2.5 font-inter text-[12px] leading-relaxed text-white/40">
          A transparent PNG or an SVG prints cleanest on dark garments.
        </p>
      )}
    </div>
  );
}
