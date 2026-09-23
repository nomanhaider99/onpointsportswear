import type { Product } from "@/data/products";
import { JERSEY_STUDIO_URL } from "@/lib/config";

const STUDIO_BASE = (JERSEY_STUDIO_URL || "https://customizer.betterbuildsc.com").replace(
  /\/$/,
  "",
);

/** Only products with type `customizable` (mapped to `product.customizable`). */
export function usesJerseyStudio(product: Product): boolean {
  return Boolean(product.customizable);
}

/** Opens the hosted Vite customizer with product context in the query string. */
export function jerseyStudioHref(product: Product, size?: string): string {
  const params = new URLSearchParams({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
  });
  const variation = product.sizes.find((entry) => entry.label === size) || product.sizes[0];
  if (variation) {
    params.set("size", variation.label);
    params.set("price", String(variation.price));
  }
  return `${STUDIO_BASE}/?${params.toString()}`;
}
