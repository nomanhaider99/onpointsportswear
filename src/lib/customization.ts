"use client";

import type { Product } from "@/data/products";
import type { LogoTransform } from "@/lib/customizer-geometry";

export type { LogoTransform };

/**
 * The serializable customization payload and the single seam the backend
 * developer plugs into. Nothing here performs I/O.
 */

export interface UploadedLogo {
  /**
   * The original File. Kept as a reference (not base64) so the payload can be
   * posted as multipart later without ever holding a large string in state.
   */
  file: File;
  fileName: string;
  /** Object URL for preview. Revoked by the customizer when replaced/removed. */
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
}

/** Matches the payload shape agreed for backend handoff. */
export interface ProductCustomization {
  productId: string;
  productVariantId?: string;
  printAreaId: string;
  printAreaName: string;
  logoFileName?: string;
  /** Object URL - valid for this page session only. */
  logoPreviewUrl?: string;
  /** Populated on demand by `withLogoDataUrl`, never held in live state. */
  logoDataUrl?: string;
  transform: LogoTransform;
  /**
   * Coordinate space `transform` is expressed in. The backend needs this to
   * re-render the composite at print resolution.
   */
  designSpace: { width: number; height: number };
  /**
   * Every print area the customer positioned a logo in. The current UI applies
   * one at a time; this keeps multi-placement orders possible without a
   * payload change.
   */
  placements: Record<string, LogoTransform>;
}

export interface AddCustomizedProductInput {
  product: Product;
  variant?: { size: string; price: number };
  customization: ProductCustomization;
  quantity?: number;
}

/** Lightweight summary stored on the cart line - deliberately no image data. */
export interface CartItemCustomization {
  customizationId: string;
  printAreaId: string;
  printAreaName: string;
  logoFileName?: string;
  transform: LogoTransform;
}

/**
 * In-memory registry of full customization payloads, keyed by customizationId.
 *
 * Cart lines persist to localStorage, so they only carry the summary above.
 * The heavy parts (File, object URL) live here for the page session and are
 * what the backend integration will read when it posts the order.
 */
const customizations = new Map<string, ProductCustomization>();

let counter = 0;

export function createCustomizationId(productId: string): string {
  counter += 1;
  return `${productId}-custom-${Date.now().toString(36)}-${counter}`;
}

export function getCustomization(id: string): ProductCustomization | undefined {
  return customizations.get(id);
}

export function getAllCustomizations(): ProductCustomization[] {
  return [...customizations.values()];
}

/** Reads the File back as a data URL for backends that want an inline payload. */
export function withLogoDataUrl(
  customization: ProductCustomization,
  logo: UploadedLogo,
): Promise<ProductCustomization> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ ...customization, logoDataUrl: String(reader.result) });
    reader.onerror = () => reject(new Error("Could not read the logo file."));
    reader.readAsDataURL(logo.file);
  });
}

/**
 * Frontend integration point for adding a customized product.
 *
 * Today it registers the payload in frontend state and hands back a summary the
 * existing cart can persist. The order/upload calls belong here.
 *
 * TODO: Connect to backend/cart API - POST the logo file plus `customization`
 * (transform + designSpace + placements) and store the returned asset id.
 */
export function handleAddCustomizedProduct({
  product,
  variant,
  customization,
  quantity = 1,
}: AddCustomizedProductInput): { customizationId: string; summary: CartItemCustomization } {
  const customizationId = createCustomizationId(product.id);
  const stored: ProductCustomization = {
    ...customization,
    productVariantId: variant?.size ?? customization.productVariantId,
  };

  customizations.set(customizationId, stored);

  if (process.env.NODE_ENV === "development") {
    // Visible during development so the payload shape is easy to inspect.
    console.info("[customizer] handleAddCustomizedProduct", {
      customizationId,
      product: { id: product.id, slug: product.slug, name: product.name },
      variant,
      quantity,
      customization: stored,
    });
  }

  return {
    customizationId,
    summary: {
      customizationId,
      printAreaId: stored.printAreaId,
      printAreaName: stored.printAreaName,
      logoFileName: stored.logoFileName,
      transform: stored.transform,
    },
  };
}
