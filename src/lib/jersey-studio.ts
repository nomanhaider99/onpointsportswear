import type { Product } from "@/data/products";

/**
 * Every customizable shop product opens the hockey/jersey Vite studio
 * (embedded at /customize/jersey) instead of the logo-only dialog.
 */
export function usesJerseyStudio(product: Product): boolean {
  return Boolean(product.customizable);
}

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
  return `/customize/jersey?${params.toString()}`;
}
