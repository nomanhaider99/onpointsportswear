"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import type { UploadedLogo } from "@/lib/customization";

/**
 * Accessible file picker with drag-and-drop. The input stays a real
 * <input type="file"> behind a label so keyboard and screen-reader users get
 * the native control; the styled box is the label.
 */

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

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold uppercase tracking-wide text-white">
          {logo ? "Your Logo" : "Upload Your Logo"}
        </h3>
        {logo && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-9 items-center gap-1.5 rounded px-1.5 py-2 text-sm text-white/70 transition-colors hover:text-primary"
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onSelect(event.dataTransfer.files?.[0]);
        }}
        className={`mt-3 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed p-4 transition-colors ${
          isDragging ? "border-primary bg-primary-soft" : "border-[var(--color-primary-line)] bg-white/[0.04]"
        }`}
      >
        {logo ? (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/10">
            {/* Object URL of a local file - next/image cannot optimise it. */}
            <Image
              src={logo.previewUrl}
              alt={`Uploaded logo: ${logo.fileName}`}
              fill
              unoptimized
              className="object-contain"
            />
          </span>
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <ImagePlus size={22} aria-hidden="true" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-base text-white">
            {logo ? logo.fileName : "Drag a file here or browse"}
          </span>
          <span className="mt-0.5 block text-sm text-white/60">
            {logo
              ? `${logo.naturalWidth} × ${logo.naturalHeight}px`
              : `PNG, JPG, WEBP or SVG · up to ${maxFileSizeMB}MB`}
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm text-white">
          <Upload size={15} aria-hidden="true" />
          {logo ? "Replace" : "Browse"}
        </span>
      </label>

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

      <p aria-live="polite" className={isUploading ? "mt-2 text-sm text-white/70" : "sr-only"}>
        {isUploading ? "Loading your logo…" : ""}
      </p>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-[#ff6b6b]">
          {error}
        </p>
      )}

      {!logo && !error && (
        <p className="mt-3 text-sm text-white/60">
          Transparent PNG files give the cleanest result on dark garments.
        </p>
      )}
    </div>
  );
}
