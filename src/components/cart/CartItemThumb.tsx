"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/cart";

/** Cart / checkout thumbnail — supports https, data URLs, and catalog fallback. */
export function CartItemThumb({
  item,
  catalogImage,
  sizes = "64px",
  className = "object-cover",
}: {
  item: CartItem;
  /** Optional catalog product image when line has no preview. */
  catalogImage?: string;
  sizes?: string;
  className?: string;
}) {
  const src =
    (item.image && item.image.trim()) ||
    item.customization?.previewDataUrl ||
    item.catalogImage ||
    catalogImage ||
    "/images/logo.png";

  const isData = src.startsWith("data:");
  const useNativeImg = isData || !/^https?:\/\//i.test(src);

  if (useNativeImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={item.name} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return (
    <Image src={src} alt={item.name} fill sizes={sizes} className={className} unoptimized />
  );
}
