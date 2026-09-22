"use client";

import { useEffect } from "react";
import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { fetchShopCatalog } from "@/store/features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function FeaturedProducts() {
  const dispatch = useAppDispatch();
  const featured = useAppSelector((state) => state.catalog.featured);
  const products = useAppSelector((state) => state.catalog.products);
  const loading = useAppSelector((state) => state.catalog.loading);

  useEffect(() => {
    dispatch(fetchShopCatalog());
  }, [dispatch]);

  const visible = (featured.length ? featured : products).slice(0, 6);

  return (
    <Section tinted>
      <div className="container-site">
        <div className="lg:w-4/5">
          <Eyebrow className="max-md:text-center">PRODUCTS</Eyebrow>
          <SectionHeading className="mt-2 max-md:text-center">
            FEATURED PRODUCTS
          </SectionHeading>
        </div>
      </div>

      <div className="container-site mt-[25px]">
        {loading && visible.length === 0 ? (
          <p className="text-center text-white/70">Loading products…</p>
        ) : (
          <ProductGrid
            products={visible}
            columns={3}
            showCategory={false}
            showAddToCart={false}
            showCustomizableBadge={false}
            filled={false}
          />
        )}
      </div>

      <div className="container-site mt-6 flex justify-center">
        <ButtonLink href="/products" variant="outline">
          VIEW ALL
        </ButtonLink>
      </div>
    </Section>
  );
}
