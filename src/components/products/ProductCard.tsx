import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { cn, formatPriceRange } from "@/lib/utils";

import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({
  product,
  showCategory = true,
  showAddToCart = true,
  filled = true,
  priority = false,
}: {
  product: Product;
  /** The featured grid on the home page omits the category label. */
  showCategory?: boolean;
  showAddToCart?: boolean;
  /** The archive cards use a solid #111827 surface; the featured grid is transparent. */
  filled?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl p-5 transition-colors duration-300",
        filled ? "bg-card hover:bg-[#151d2f]" : "bg-transparent hover:bg-card",
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-lg"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.image}
          alt=""
          width={600}
          height={320}
          priority={priority}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="h-[320px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        {showCategory && (
          <p className="font-[family-name:var(--font-inter)] text-xs font-bold uppercase text-primary">
            {product.category}
          </p>
        )}
        <h3 className="mt-1 text-lg font-semibold text-secondary">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors duration-300 hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-secondary">
          {formatPriceRange(product.priceMin, product.priceMax)}
        </p>
        {showAddToCart && (
          <div className="mt-auto flex pt-2.5">
            <AddToCartButton product={product} />
          </div>
        )}
      </div>
    </article>
  );
}
