import type { Product } from "@/data/products";
import { JERSEY_STUDIO_URL } from "@/lib/config";
import { getStoredToken } from "@/lib/api/client";

const STUDIO_BASE = (JERSEY_STUDIO_URL || "https://customizer.betterbuildsc.com").replace(
  /\/$/,
  "",
);

/** Only products with type `customizable` (mapped to `product.customizable`). */
export function usesJerseyStudio(product: Product): boolean {
  return Boolean(product.customizable);
}

export type JerseyStudioOptions = {
  size?: string;
  /** Pass auth token so Save Design stores under this client/user id. */
  token?: string;
  /** Resume editing a previously saved design for this user. */
  savedDesignId?: string;
};

/** Opens the hosted Vite customizer with product context (website checkout path). */
export function jerseyStudioHref(
  product: Product,
  sizeOrOptions?: string | JerseyStudioOptions,
): string {
  const options: JerseyStudioOptions =
    typeof sizeOrOptions === "string" || sizeOrOptions == null
      ? { size: sizeOrOptions }
      : sizeOrOptions;

  const params = new URLSearchParams({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    embed: "web",
  });
  const variation =
    product.sizes.find((entry) => entry.label === options.size) || product.sizes[0];
  if (variation) {
    params.set("size", variation.label);
    params.set("price", String(variation.price));
  }
  const token =
    typeof options.token === "string" && options.token
      ? options.token
      : typeof window !== "undefined"
        ? getStoredToken()
        : "";
  if (token) params.set("token", token);
  if (options.savedDesignId) params.set("savedDesignId", options.savedDesignId);
  return `${STUDIO_BASE}/?${params.toString()}`;
}

/** Edit an existing account design in the customizer (resumes saved step/state). */
export function editSavedDesignHref(design: {
  _id?: string;
  id?: string;
  product?: { _id?: string; id?: string; slug?: string; name?: string; thumbnail?: string; images?: string[] };
  productId?: string;
  name?: string;
  size?: string;
  price?: number;
  previewUrl?: string;
}): string {
  const id = String(design._id || design.id || "");
  const productId = String(
    design.product?._id || design.product?.id || design.productId || "studio-jersey",
  );
  const params = new URLSearchParams({
    productId,
    slug: design.product?.slug || productId,
    name: design.name || design.product?.name || "Custom Design",
    image:
      design.previewUrl ||
      design.product?.thumbnail ||
      design.product?.images?.[0] ||
      "",
    embed: "web",
  });
  if (design.size) params.set("size", String(design.size));
  if (design.price) params.set("price", String(design.price));
  if (id) params.set("savedDesignId", id);
  const token = typeof window !== "undefined" ? getStoredToken() : "";
  if (token) params.set("token", token);
  return `${STUDIO_BASE}/?${params.toString()}`;
}
