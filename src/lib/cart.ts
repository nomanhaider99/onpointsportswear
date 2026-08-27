"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Product } from "@/data/products";

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
    item.quantity > 0
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

function makeKey(slug: string, size: string) {
  return `${slug}::${size}`;
}

export function useCart() {
  const currentItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((product: Product, size: string, quantity = 1) => {
    const variation = product.sizes.find((entry) => entry.label === size);
    const price = variation ? variation.price : product.priceMin;
    const key = makeKey(product.slug, size);
    const existing = items.find((item) => item.key === key);

    if (existing) {
      setItems(
        items.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      );
      return;
    }

    setItems([
      ...items,
      { key, slug: product.slug, name: product.name, size, price, image: product.image, quantity },
    ]);
  }, []);

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
