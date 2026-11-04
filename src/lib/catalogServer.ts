import "server-only";

import { getApiUrl } from "@/lib/config";
import { mapCategories, mapProductList, type ApiCategory } from "@/lib/api/mapProduct";
import type { Product } from "@/data/products";

export type ServerCatalog = {
  products: Product[];
  categories: ApiCategory[];
  error: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const base = getApiUrl();
  const response = await fetch(`${base}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    throw new Error(`API ${path} failed (${response.status})`);
  }
  return (await response.json()) as T;
}

/** Server-side catalog load so /products works even if client JS fetch fails. */
export async function loadServerCatalog(): Promise<ServerCatalog> {
  try {
    const [productData, categoriesRaw] = await Promise.all([
      fetchJson<{ products?: unknown[] }>("/products?limit=100&lean=true"),
      fetchJson<unknown>("/categories").catch(() => []),
    ]);
    const products = mapProductList(productData.products || []);
    return {
      products,
      categories: mapCategories(categoriesRaw),
      error: products.length ? "" : "No products returned from the API.",
    };
  } catch (error) {
    return {
      products: [],
      categories: [],
      error: error instanceof Error ? error.message : "Could not load products",
    };
  }
}
