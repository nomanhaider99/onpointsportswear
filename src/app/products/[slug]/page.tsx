import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";
import { formatPriceRange } from "@/lib/utils";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  return (
    <>
      <section className="py-[50px] lg:py-[100px]">
        <ProductDetail product={product} />
      </section>

      {related.length > 0 && (
        <Section>
          <div className="container-site">
            <SectionHeading>
              RELATED <span className="text-primary">PRODUCTS</span>
            </SectionHeading>
          </div>
          <div className="container-site mt-[25px]">
            <ProductGrid products={related} columns={3} />
          </div>
        </Section>
      )}
    </>
  );
}
