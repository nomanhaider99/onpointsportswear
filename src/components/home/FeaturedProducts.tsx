import { Section } from "@/components/ui/Section";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { products } from "@/data/products";

export function FeaturedProducts() {
  const featured = products.filter((product) => product.featured);

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
        <ProductGrid
          products={featured}
          columns={3}
          showCategory={false}
          showAddToCart={false}
          showCustomizableBadge={false}
          filled={false}
        />
      </div>

      <div className="container-site mt-6 flex justify-center">
        <ButtonLink href="/products" variant="outline">
          VIEW ALL
        </ButtonLink>
      </div>
    </Section>
  );
}
