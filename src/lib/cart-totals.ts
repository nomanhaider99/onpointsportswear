import type { CartItem } from "@/lib/cart";
import { cartItemCompareAt } from "@/lib/cart";

/** Matches sports_backend orderController shipping rule. */
export const FREE_SHIPPING_MIN = 100;
export const FLAT_SHIPPING_FEE = 8;

export type CartTotalsInput = {
  items: CartItem[];
  /** Catalog originalPrice by slug — fills gaps when cart line has no originalPrice. */
  catalogOriginalBySlug?: Record<string, number | undefined>;
  couponDiscount?: number;
};

export type CartTotals = {
  itemCount: number;
  /** Sum of sale line totals. */
  subtotal: number;
  /** Product list-price savings (before coupon). */
  productDiscount: number;
  couponDiscount: number;
  /** productDiscount + couponDiscount */
  discountTotal: number;
  shipping: number;
  shippingLabel: string;
  /** subtotal - couponDiscount + shipping */
  total: number;
  originalTotal: number;
};

export function computeCartTotals({
  items,
  catalogOriginalBySlug = {},
  couponDiscount = 0,
}: CartTotalsInput): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let originalTotal = 0;
  let productDiscount = 0;
  for (const item of items) {
    const compare = cartItemCompareAt(item, catalogOriginalBySlug[item.slug]);
    const unitOriginal = compare > 0 ? compare : item.price;
    originalTotal += unitOriginal * item.quantity;
    if (compare > 0) productDiscount += (compare - item.price) * item.quantity;
  }

  const coupon = Math.max(0, Number(couponDiscount) || 0);
  const discountTotal = Number((productDiscount + coupon).toFixed(2));
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING_FEE;
  const total = Number(Math.max(0, subtotal - coupon + shipping).toFixed(2));

  return {
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    productDiscount: Number(productDiscount.toFixed(2)),
    couponDiscount: Number(coupon.toFixed(2)),
    discountTotal,
    shipping,
    shippingLabel: shipping > 0 ? "" : "FREE",
    total,
    originalTotal: Number(originalTotal.toFixed(2)),
  };
}

export function cartItemsForQuote(items: CartItem[]) {
  return items.map((item) => {
    const preview = String(item.customization?.previewUrl || item.image || "").trim();
    const customImage =
      preview && !/^(data:|blob:)/i.test(preview) ? preview : "";
    return {
      productId: item.productId,
      slug: item.slug,
      quantity: item.quantity,
      size: item.size,
      custom: Boolean(item.customizable || item.customization),
      customImage,
      customization: item.customization || null,
    };
  });
}
