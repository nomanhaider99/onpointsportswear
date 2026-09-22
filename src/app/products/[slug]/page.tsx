import type { Metadata } from "next";
import { ProductPageClient } from "@/components/products/ProductPageClient";
import { catalogApi } from "@/lib/api/client";
import { mapProduct, mapProductList, type ApiProduct } from "@/lib/api/mapProduct";
import { formatPriceRange } from "@/lib/utils";
import { getProductBySlug } from "@/data/products";

export const dynamicParams = true;

async function loadProduct(slug: string) {
  try {
    if (/^[a-f0-9]{24}$/i.test(slug)) {
      return mapProduct((await catalogApi.product(slug)) as unknown as ApiProduct);
    }
    const data = await catalogApi.products({ search: slug, limit: 80 });
    return mapProductList(data.products).find((product) => product.slug === slug) || getProductBySlug(slug);
  } catch {
    return getProductBySlug(slug);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found" };

  const description = `${product.name} — ${formatPriceRange(product.priceMin, product.priceMax)}. Custom ${product.category.toLowerCase()} from On Point Sportswear with no minimum orders.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${product.slug}`,
      title: product.name,
      description,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
