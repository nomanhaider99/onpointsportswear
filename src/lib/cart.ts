"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { isCustomizable } from "@/data/customizer";
import type { Product } from "@/data/products";
import type { CartItemCustomization } from "@/lib/customization";
import { notify } from "@/lib/notify";
import {
  addCartItem,
  clearCart as clearCartAction,
  clearCartCoupon,
  decrementCartItem,
  incrementCartItem,
  removeCartItem,
  setCartCoupon,
  updateCartQuantity,
} from "@/store/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cartItemsForQuote, computeCartTotals } from "@/lib/cart-totals";
import { ordersApi } from "@/lib/api/client";

export interface CartItem {
  key: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  /** Catalog product thumb — used when jersey preview upload is unavailable. */
  catalogImage?: string;
  quantity: number;
  productId?: string;
  originalPrice?: number;
  customization?: CartItemCustomization;
  customizable?: boolean;
}

export type CartKind = "empty" | "standard" | "customizable";

/** List price when the line is on sale; otherwise 0. */
export function cartItemCompareAt(item: CartItem, catalogOriginal?: number) {
  const original = Number(item.originalPrice || catalogOriginal || 0);
  return original > item.price ? original : 0;
}

export function getCartKind(entries: CartItem[]): CartKind {
  if (entries.length === 0) return "empty";
  return entries.some((entry) => entry.customizable) ? "customizable" : "standard";
}

export const MISSING_LOGO_MESSAGE =
  "Add your logo to this product before adding it to your cart.";

export function getMixMessage(incoming: CartKind): string {
  return incoming === "customizable"
    ? "Your cart has standard products. Custom-logo items must be ordered separately - check out or clear your cart first."
    : "Your cart has custom-logo items. Standard products must be ordered separately - check out or clear your cart first.";
}

export function getAddToCartIssue(
  product: Product,
  entries: CartItem[],
  hasCustomization = false,
): string | null {
  const needsLogo = isCustomizable(product);
  const kind = getCartKind(entries);
  const incoming: CartKind = needsLogo ? "customizable" : "standard";
  if (kind !== "empty" && kind !== incoming) return getMixMessage(incoming);
  if (needsLogo && !hasCustomization) return MISSING_LOGO_MESSAGE;
  return null;
}

export interface AddItemResult {
  ok: boolean;
  reason?: string;
}

function cartSignature(items: CartItem[]) {
  return items.map((item) => `${item.key}:${item.quantity}`).join("|");
}

export function useCart() {
  const dispatch = useAppDispatch();
  const currentItems = useAppSelector((state) => state.cart.items);
  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const couponDiscount = useAppSelector((state) => state.cart.couponDiscount);
  const catalog = useAppSelector((state) => state.catalog.products);
  const requoteToken = useRef(0);
  const itemsSignature = cartSignature(currentItems);

  // Keep promo discount in sync when qty / lines change (same as app server cart).
  useEffect(() => {
    if (!couponCode || !currentItems.length) return;
    const token = ++requoteToken.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const quote = await ordersApi.quote({
            items: cartItemsForQuote(currentItems),
            couponCode,
          });
          if (token !== requoteToken.current) return;
          const discount = Number(quote.discount_total ?? quote.couponDiscount ?? 0) || 0;
          const applied = String(quote.couponCode || "").toUpperCase();
          if (!applied) {
            dispatch(clearCartCoupon());
            return;
          }
          if (applied !== couponCode || discount !== couponDiscount) {
            dispatch(setCartCoupon({ code: applied, discount }));
          }
        } catch {
          /* keep existing coupon on transient quote errors */
        }
      })();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [itemsSignature, couponCode, couponDiscount, currentItems, dispatch]);

  const addItem = useCallback(
    (
      product: Product,
      size: string,
      quantity = 1,
      customization?: CartItemCustomization,
    ): AddItemResult => {
      const issue = getAddToCartIssue(product, currentItems, Boolean(customization));
      if (issue) {
        notify.error(issue);
        return { ok: false, reason: issue };
      }
      dispatch(addCartItem({ product, size, quantity, customization }));
      notify.success(`${product.name} added to cart`);
      return { ok: true };
    },
    [dispatch, currentItems],
  );

  const removeItem = useCallback(
    (key: string) => {
      dispatch(removeCartItem(key));
      notify.info("Item removed from cart");
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      dispatch(updateCartQuantity({ key, quantity }));
    },
    [dispatch],
  );

  const incrementItem = useCallback(
    (key: string) => {
      dispatch(incrementCartItem(key));
    },
    [dispatch],
  );

  const decrementItem = useCallback(
    (key: string) => {
      dispatch(decrementCartItem(key));
    },
    [dispatch],
  );

  const clearCart = useCallback((options?: { silent?: boolean }) => {
    dispatch(clearCartAction());
    if (!options?.silent) notify.info("Cart cleared");
  }, [dispatch]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) throw new Error("Enter a promo code");
      if (!currentItems.length) throw new Error("Your cart is empty");
      const quote = await ordersApi.quote({
        items: cartItemsForQuote(currentItems),
        couponCode: trimmed,
      });
      const discount = Number(quote.discount_total ?? quote.couponDiscount ?? 0) || 0;
      const applied = String(quote.couponCode || trimmed).toUpperCase();
      if (!quote.couponCode && discount <= 0) {
        throw new Error("This coupon does not apply to your cart");
      }
      dispatch(setCartCoupon({ code: applied, discount }));
      notify.success(`${applied} applied`);
    },
    [currentItems, dispatch],
  );

  const removeCoupon = useCallback(() => {
    dispatch(clearCartCoupon());
    notify.info("Promo code removed");
  }, [dispatch]);

  const catalogOriginalBySlug = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    for (const product of catalog) {
      map[product.slug] = product.originalPrice;
    }
    return map;
  }, [catalog]);

  const totals = useMemo(
    () =>
      computeCartTotals({
        items: currentItems,
        catalogOriginalBySlug,
        couponDiscount,
      }),
    [currentItems, catalogOriginalBySlug, couponDiscount],
  );

  const { count, subtotal } = useMemo(
    () => ({
      count: totals.itemCount,
      subtotal: totals.subtotal,
    }),
    [totals],
  );

  return {
    items: currentItems,
    kind: getCartKind(currentItems),
    count,
    subtotal,
    totals,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    addItem,
    removeItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    clearCart,
  };
}
