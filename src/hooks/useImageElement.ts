"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "loaded" | "failed";

/**
 * Loads a URL into an HTMLImageElement for Konva to draw.
 *
 * A tiny local hook instead of the `use-image` package - it is a handful of
 * lines and avoids adding a dependency for it.
 *
 * Results are stored alongside the URL that produced them and the status is
 * derived, so switching `src` reports "loading" immediately without the effect
 * having to reset state on the way in.
 */
export function useImageElement(src: string | undefined) {
  const [loaded, setLoaded] = useState<{ src: string; image: HTMLImageElement } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const element = new window.Image();

    element.onload = () => {
      if (!cancelled) setLoaded({ src, image: element });
    };
    element.onerror = () => {
      if (!cancelled) setFailedSrc(src);
    };
    element.src = src;

    return () => {
      cancelled = true;
      element.onload = null;
      element.onerror = null;
    };
  }, [src]);

  const image = loaded && loaded.src === src ? loaded.image : undefined;

  let status: Status;
  if (!src) status = "idle";
  else if (image) status = "loaded";
  else if (failedSrc === src) status = "failed";
  else status = "loading";

  return { image, status } as const;
}
