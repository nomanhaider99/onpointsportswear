"use client";

import { useCallback, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import type { UploadedLogo } from "@/lib/customization";

/**
 * Validates and decodes a user-selected logo entirely in the browser.
 *
 * No network calls: the file becomes an object URL, is decoded once to read its
 * intrinsic size, and the URL is revoked as soon as it is replaced or dropped.
 */

interface Options {
  allowedFileTypes: string[];
  maxFileSizeMB: number;
}

function extensionLabel(types: string[]): string {
  const labels: Record<string, string> = {
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/webp": "WEBP",
    "image/svg+xml": "SVG",
  };
  const seen = types.map((type) => labels[type] ?? type).filter(Boolean);
  if (seen.length < 2) return seen.join("");
  return `${seen.slice(0, -1).join(", ")} or ${seen[seen.length - 1]}`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode-failed"));
    image.src = url;
  });
}

export function useLogoUpload({ allowedFileTypes, maxFileSizeMB }: Options) {
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks the live object URL so it can be revoked without reading state.
  const objectUrl = useRef<string | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
  }, []);

  const clearLogo = useCallback(() => {
    releaseObjectUrl();
    setLogo(null);
    setError(null);
  }, [releaseObjectUrl]);

  const selectFile = useCallback(
    async (file: File | null | undefined): Promise<UploadedLogo | null> => {
      if (!file) return null;

      const typeAllowed = allowedFileTypes.includes(file.type);
      const sizeAllowed = file.size <= maxFileSizeMB * 1024 * 1024;

      if (!typeAllowed || !sizeAllowed) {
        setError(
          `Please upload a ${extensionLabel(allowedFileTypes)} image under ${maxFileSizeMB}MB.`,
        );
        notify.error(`Please upload a ${extensionLabel(allowedFileTypes)} image under ${maxFileSizeMB}MB.`);
        return null;
      }

      setIsUploading(true);
      setError(null);

      const url = URL.createObjectURL(file);

      try {
        const image = await loadImage(url);

        /*
         * An SVG without intrinsic width/height reports 0 in some browsers,
         * which would give the logo no aspect ratio to preserve. Reject it with
         * an actionable message rather than rendering a collapsed box.
         */
        if (!image.naturalWidth || !image.naturalHeight) {
          URL.revokeObjectURL(url);
          setError(
            "That image has no fixed dimensions. Re-export it with a set width and height, or upload a PNG.",
          );
          notify.error("That image has no fixed dimensions. Re-export it as a PNG with a set width and height.");
          return null;
        }

        // Only drop the previous logo once the new one is known to be good.
        releaseObjectUrl();
        objectUrl.current = url;

        const next: UploadedLogo = {
          file,
          fileName: file.name,
          previewUrl: url,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          aspectRatio: image.naturalWidth / image.naturalHeight,
        };

        setLogo(next);
        return next;
      } catch {
        URL.revokeObjectURL(url);
        setError("That file could not be opened as an image. Please try another file.");
        notify.error("That file could not be opened as an image. Please try another file.");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [allowedFileTypes, maxFileSizeMB, releaseObjectUrl],
  );

  return { logo, isUploading, error, setError, selectFile, clearLogo };
}
