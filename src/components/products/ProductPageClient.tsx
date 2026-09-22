"use client";

import { useEffect, useMemo } from "react";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";
import { getProductBySlug } from "@/data/products";
import { fetchProductBySlug, fetchShopCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function ProductPageClient({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const { products, current, productLoading, loading, bySlug, error } = useAppSelector((state) => state.catalog);

  const product =
    (current?.slug === slug ? current : bySlug[slug] || products.find((item) => item.slug === slug)) ||
    getProductBySlug(slug);

  useEffect(() => {
    if (!products.length) dispatch(fetchShopCatalog());
    if (!product || product.slug !== slug) dispatch(fetchProductBySlug(slug));
  }, [dispatch, products.length, product, slug]);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(
      (candidate) => candidate.category === product.category && candidate.slug !== product.slug,
    );
    const filler = products.filter(
      (candidate) => candidate.category !== product.category && candidate.slug !== product.slug,
    );
    return [...sameCategory, ...filler].slice(0, 3);
  }, [product, products]);

  if ((productLoading || loading) && !product) {
    return (
      <section className="py-[50px] lg:py-[100px]">
        <p className="container-site text-center text-base text-white/70">Loading product…</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="py-[50px] lg:py-[100px]">
        <p className="container-site text-center text-base text-white">{error || "This product could not be found."}</p>
      </section>
    );
  }

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
