import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  columns = 2,
  showCategory = true,
  showAddToCart = true,
  showCustomizableBadge = true,
  filled = true,
}: {
  products: Product[];
  /** Desktop column count - the archive uses 2, the home featured grid uses 3. */
  columns?: 2 | 3;
  showCategory?: boolean;
  showAddToCart?: boolean;
  showCustomizableBadge?: boolean;
  filled?: boolean;
}) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-base text-[#656565]">No products found</p>;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 md:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          showCategory={showCategory}
          showAddToCart={showAddToCart}
          showCustomizableBadge={showCustomizableBadge}
          filled={filled}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
