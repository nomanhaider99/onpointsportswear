"use client";

import { useCallback, useMemo } from "react";
import { isCustomizable } from "@/data/customizer";
import type { Product } from "@/data/products";
import type { CartItemCustomization } from "@/lib/customization";
import { notify } from "@/lib/notify";
import {
  addCartItem,
  clearCart as clearCartAction,
  decrementCartItem,
  incrementCartItem,
  removeCartItem,
  updateCartQuantity,
} from "@/store/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export interface CartItem {
  key: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
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

export function useCart() {
  const dispatch = useAppDispatch();
  const currentItems = useAppSelector((state) => state.cart.items);

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

  const { count, subtotal } = useMemo(
    () => ({
      count: currentItems.reduce((total, item) => total + item.quantity, 0),
      subtotal: currentItems.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    [currentItems],
  );

  return {
    items: currentItems,
    kind: getCartKind(currentItems),
    count,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    clearCart,
  };
}
