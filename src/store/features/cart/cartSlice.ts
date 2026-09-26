import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isCustomizable } from "@/data/customizer";
import type { Product } from "@/data/products";
import { mediaUrl } from "@/lib/api/client";
import { getAddToCartIssue, getCartKind, type CartItem } from "@/lib/cart";
import type { CartItemCustomization } from "@/lib/customization";

const STORAGE_KEY = "op-cart-v1";

type CartState = {
  items: CartItem[];
};

function makeKey(slug: string, size: string, customizationId?: string) {
  return customizationId ? `${slug}::${size}::${customizationId}` : `${slug}::${size}`;
}

function readStored(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function withProxiedImages(items: CartItem[]) {
  return items.map((item) => ({ ...item, image: mediaUrl(item.image) || item.image }));
}

function persist(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] } as CartState,
  reducers: {
    hydrateCart(state) {
      state.items = withProxiedImages(readStored());
    },
    addCartItem(
      state,
      action: PayloadAction<{
        product: Product;
        size: string;
        quantity?: number;
        customization?: CartItemCustomization;
      }>,
    ) {
      const { product, size, quantity = 1, customization } = action.payload;
      const issue = getAddToCartIssue(product, state.items, Boolean(customization));
      if (issue) return;
      const variation = product.sizes.find((entry) => entry.label === size);
      const price = variation ? variation.price : product.priceMin;
      const originalPrice =
        product.originalPrice && product.originalPrice > price ? product.originalPrice : undefined;
      const key = makeKey(product.slug, size, customization?.customizationId);
      const existing = state.items.find((item) => item.key === key);
      if (existing) {
        existing.quantity += quantity;
        if (!existing.originalPrice) existing.originalPrice = originalPrice;
      } else {
        state.items.push({
          key,
          slug: product.slug,
          name: product.name,
          size,
          price,
          originalPrice,
          image: mediaUrl(product.image) || product.image,
          quantity,
          productId: product.id,
          customizable: isCustomizable(product),
          ...(customization ? { customization } : {}),
        });
      }
      persist(state.items);
    },
    removeCartItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.key !== action.payload);
      persist(state.items);
    },
    updateCartQuantity(state, action: PayloadAction<{ key: string; quantity: number }>) {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.key !== key);
      } else {
        state.items = state.items.map((item) => (item.key === key ? { ...item, quantity } : item));
      }
      persist(state.items);
    },
    incrementCartItem(state, action: PayloadAction<string>) {
      state.items = state.items.map((item) =>
        item.key === action.payload ? { ...item, quantity: item.quantity + 1 } : item,
      );
      persist(state.items);
    },
    decrementCartItem(state, action: PayloadAction<string>) {
      state.items = state.items
        .map((item) => (item.key === action.payload ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
    /** Jersey studio / iframe handoff — merge a ready-made cart line. */
    upsertStudioCartItem(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const issue = getAddToCartIssue(
        {
          id: incoming.productId || incoming.slug,
          slug: incoming.slug,
          name: incoming.name,
          category: "Jerseys",
          priceMin: incoming.price,
          priceMax: incoming.price,
          image: incoming.image,
          sizes: [{ label: incoming.size, price: incoming.price }],
          customizable: true,
          featured: false,
        } as Product,
        state.items,
        Boolean(incoming.customization),
      );
      if (issue) return;
      const existing = state.items.find((item) => item.key === incoming.key);
      if (existing) {
        existing.quantity += incoming.quantity || 1;
      } else {
        state.items.push({
          ...incoming,
          image:
            mediaUrl(incoming.image) ||
            incoming.image ||
            mediaUrl(incoming.customization?.previewUrl) ||
            incoming.customization?.previewUrl ||
            mediaUrl(incoming.catalogImage) ||
            incoming.catalogImage ||
            "",
          customizable: true,
        });
      }
      persist(state.items);
    },
    replaceCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = withProxiedImages(action.payload);
      persist(state.items);
    },
  },
});

export const {
  hydrateCart,
  addCartItem,
  removeCartItem,
  updateCartQuantity,
  incrementCartItem,
  decrementCartItem,
  clearCart,
  upsertStudioCartItem,
  replaceCartItems,
} = cartSlice.actions;

export const selectCartKind = (items: CartItem[]) => getCartKind(items);

export default cartSlice.reducer;
