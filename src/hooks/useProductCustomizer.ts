"use client";

import { useCallback, useMemo, useState } from "react";
import type { PrintArea, ResolvedCustomizerConfig } from "@/data/customizer";
import type { Product } from "@/data/products";
import type { ProductCustomization } from "@/lib/customization";
import { useLogoUpload } from "@/hooks/useLogoUpload";
import {
  type LogoTransform,
  centerHorizontally,
  centerVertically,
  constrainTransform,
  defaultTransformFor,
  sizePercent,
  widthFromPercent,
} from "@/lib/customizer-geometry";

/**
 * Owns the whole customizer state machine: the uploaded logo, a transform per
 * print area, the active area, and serialization.
 *
 * Deliberately free of API/cart code - it hands back a plain object and lets the
 * caller decide what to do with it.
 */

export function useProductCustomizer(product: Product, config: ResolvedCustomizerConfig) {
  const { logo, isUploading, error, setError, selectFile, clearLogo } = useLogoUpload({
    allowedFileTypes: config.allowedFileTypes,
    maxFileSizeMB: config.maxFileSizeMB,
  });

  const [activePrintAreaId, setActivePrintAreaId] = useState(config.printAreas[0].id);
  /** One transform per print area, so switching placement keeps prior work. */
  const [placements, setPlacements] = useState<Record<string, LogoTransform>>({});
  const [isSelected, setIsSelected] = useState(true);

  /*
   * Object URLs are revoked where they actually accumulate: when a logo is
   * replaced and when it is removed (both in useLogoUpload). Deliberately NOT
   * in an unmount cleanup - that cleanup re-runs whenever the effect re-runs
   * and would revoke a URL the current state still points at, leaving a broken
   * preview. The browser reclaims the last URL when the document goes away.
   */

  const activePrintArea = useMemo(
    () => config.printAreas.find((area) => area.id === activePrintAreaId) ?? config.printAreas[0],
    [config.printAreas, activePrintAreaId],
  );

  const transform = placements[activePrintArea.id] ?? null;
  const aspectRatio = logo?.aspectRatio ?? 1;

  /** Every write goes through here, so an illegal transform cannot be stored. */
  const commit = useCallback(
    (area: PrintArea, next: LogoTransform, ratio: number) => {
      setPlacements((current) => ({
        ...current,
        [area.id]: constrainTransform(next, area, ratio),
      }));
    },
    [],
  );

  const updateTransform = useCallback(
    (updater: (current: LogoTransform) => LogoTransform) => {
      if (!logo) return;
      setPlacements((current) => {
        const existing = current[activePrintArea.id];
        if (!existing) return current;
        return {
          ...current,
          [activePrintArea.id]: constrainTransform(
            updater(existing),
            activePrintArea,
            logo.aspectRatio,
          ),
        };
      });
    },
    [logo, activePrintArea],
  );

  const uploadLogo = useCallback(
    async (file: File | null | undefined) => {
      const next = await selectFile(file);
      if (!next) return;

      /*
       * A new logo has a new aspect ratio, so previous placements no longer
       * describe it. Reset every area to a centred default at its own size.
       */
      const fresh: Record<string, LogoTransform> = {};
      for (const area of config.printAreas) {
        fresh[area.id] = defaultTransformFor(area, next.aspectRatio);
      }
      setPlacements(fresh);
      setIsSelected(true);
    },
    [selectFile, config.printAreas],
  );

  const removeLogo = useCallback(() => {
    clearLogo();
    setPlacements({});
    setIsSelected(false);
  }, [clearLogo]);

  /** Returns the design to its just-uploaded state without dropping the logo. */
  const resetDesign = useCallback(() => {
    if (!logo) {
      setActivePrintAreaId(config.printAreas[0].id);
      setError(null);
      return;
    }
    const fresh: Record<string, LogoTransform> = {};
    for (const area of config.printAreas) {
      fresh[area.id] = defaultTransformFor(area, logo.aspectRatio);
    }
    setPlacements(fresh);
    setActivePrintAreaId(config.printAreas[0].id);
    setError(null);
  }, [logo, config.printAreas, setError]);

  const selectPrintArea = useCallback(
    (areaId: string) => {
      const area = config.printAreas.find((entry) => entry.id === areaId);
      if (!area) return;
      setActivePrintAreaId(areaId);
      // Give the area a placement on first visit so the logo appears there.
      if (logo) {
        setPlacements((current) =>
          current[areaId]
            ? current
            : { ...current, [areaId]: defaultTransformFor(area, logo.aspectRatio) },
        );
      }
    },
    [config.printAreas, logo],
  );

  const setSize = useCallback(
    (percent: number) => {
      updateTransform((current) => {
        const width = widthFromPercent(percent, activePrintArea, aspectRatio, current.rotation);
        const height = width / aspectRatio;
        // Grow and shrink about the centre so the logo does not drift.
        return {
          ...current,
          x: current.x + (current.width - width) / 2,
          y: current.y + (current.height - height) / 2,
          width,
          height,
        };
      });
    },
    [updateTransform, activePrintArea, aspectRatio],
  );

  const setRotation = useCallback(
    (rotation: number) => updateTransform((current) => ({ ...current, rotation })),
    [updateTransform],
  );

  const setPosition = useCallback(
    (x: number, y: number) => updateTransform((current) => ({ ...current, x, y })),
    [updateTransform],
  );

  const nudge = useCallback(
    (deltaX: number, deltaY: number) =>
      updateTransform((current) => ({
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY,
      })),
    [updateTransform],
  );

  const centerX = useCallback(
    () => updateTransform((current) => centerHorizontally(current, activePrintArea)),
    [updateTransform, activePrintArea],
  );

  const centerY = useCallback(
    () => updateTransform((current) => centerVertically(current, activePrintArea)),
    [updateTransform, activePrintArea],
  );

  const currentSizePercent = transform
    ? sizePercent(transform, activePrintArea, aspectRatio)
    : 0;

  /** The payload handed to the cart / backend seam. */
  const serialize = useCallback((): ProductCustomization | null => {
    if (!logo || !transform) return null;
    return {
      productId: product.id,
      printAreaId: activePrintArea.id,
      printAreaName: activePrintArea.name,
      logoFileName: logo.fileName,
      logoPreviewUrl: logo.previewUrl,
      transform,
      designSpace: { width: config.baseWidth, height: config.baseHeight },
      placements,
    };
  }, [logo, transform, product.id, activePrintArea, config, placements]);

  return {
    logo,
    isUploading,
    error,
    setError,
    transform,
    placements,
    activePrintArea,
    printAreas: config.printAreas,
    isSelected,
    setIsSelected,
    sizePercent: currentSizePercent,
    uploadLogo,
    removeLogo,
    resetDesign,
    selectPrintArea,
    setSize,
    setRotation,
    setPosition,
    nudge,
    centerX,
    centerY,
    commit,
    updateTransform,
    serialize,
    hasDesign: Boolean(logo && transform),
  };
}

export type ProductCustomizerApi = ReturnType<typeof useProductCustomizer>;
