"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { isCustomizable } from "@/data/customizer";
import type { Product } from "@/data/products";
import type { CartItemCustomization } from "@/lib/customization";

const STORAGE_KEY = "op-cart-v1";

export interface CartItem {
  /** Unique per product + size combination. */
  key: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  /**
   * Present only on customized lines. Deliberately a lightweight summary - the
   * logo file and its object URL stay in memory in @/lib/customization rather
   * than in localStorage.
   */
  customization?: CartItemCustomization;
  /**
   * Whether this line is a custom-logo product. Optional because carts stored
   * before this field existed are all standard lines; absent reads as false.
   */
  customizable?: boolean;
}

/**
 * localStorage is an external store, so the cart lives outside React and is read
 * through useSyncExternalStore. The server snapshot is always empty, which is
 * what the server renders, so hydration matches and the persisted cart appears
 * on the first client render after hydration.
 */

const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function isCartItemCustomization(value: unknown): value is CartItemCustomization {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.customizationId === "string" &&
    typeof entry.printAreaId === "string" &&
    typeof entry.transform === "object" &&
    entry.transform !== null
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.size === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    // Optional, so undefined is valid; anything else must be well formed.
    (item.customization === undefined || isCartItemCustomization(item.customization)) &&
    (item.customizable === undefined || typeof item.customizable === "boolean")
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isCartItem);
    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable (private mode / quota) - the cart still works in-session */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function setItems(next: CartItem[]) {
  items = next;
  persist();
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  // Another tab changed the cart - adopt its value without writing back.
  items = readStoredCart();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartItem[] {
  if (!initialized) {
    initialized = true;
    items = readStoredCart();
  }
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function makeKey(slug: string, size: string, customizationId?: string) {
  // Each customized line is its own row; plain lines still merge as before.
  return customizationId ? `${slug}::${size}::${customizationId}` : `${slug}::${size}`;
}

/**
 * Two ordering rules, enforced here rather than only in the UI so no caller can
 * route around them:
 *
 *  1. A customizable product cannot be ordered without an applied logo.
 *  2. A cart holds custom-logo items or standard items, never both - they are
 *     produced and quoted differently, so they need separate orders.
 */

export type CartKind = "empty" | "standard" | "customizable";

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

/**
 * Why this product cannot be added right now, or null when it can be.
 * Exported so buttons can disable themselves and explain, before any click.
 */
export function getAddToCartIssue(
  product: Product,
  entries: CartItem[],
  hasCustomization = false,
): string | null {
  // A product flagged customizable but with no usable print areas stays a
  // normal product, so it never becomes unbuyable.
  const needsLogo = isCustomizable(product);

  // The cart conflict comes first: otherwise a customer would be told to add a
  // logo for something they could not order anyway.
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
  const currentItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (
      product: Product,
      size: string,
      quantity = 1,
      customization?: CartItemCustomization,
    ): AddItemResult => {
      const issue = getAddToCartIssue(product, items, Boolean(customization));
      if (issue) return { ok: false, reason: issue };

      const variation = product.sizes.find((entry) => entry.label === size);
      const price = variation ? variation.price : product.priceMin;
      const key = makeKey(product.slug, size, customization?.customizationId);
      const existing = items.find((item) => item.key === key);

      if (existing) {
        setItems(
          items.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
          ),
        );
        return { ok: true };
      }

      setItems([
        ...items,
        {
          key,
          slug: product.slug,
          name: product.name,
          size,
          price,
          image: product.image,
          quantity,
          customizable: isCustomizable(product),
          ...(customization ? { customization } : {}),
        },
      ]);
      return { ok: true };
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setItems(items.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter((item) => item.key !== key));
      return;
    }
    setItems(items.map((item) => (item.key === key ? { ...item, quantity } : item)));
  }, []);

  const incrementItem = useCallback((key: string) => {
    setItems(items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item)));
  }, []);

  const decrementItem = useCallback((key: string) => {
    setItems(
      items
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems(EMPTY), []);

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
