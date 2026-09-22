import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiMessage, ordersApi } from "@/lib/api/client";
import type { OrderDraft } from "@/lib/checkout";
import type { CartItem } from "@/lib/cart";
import { fetchShopCatalog } from "@/store/features/catalog/catalogSlice";

function countryCode(country: string) {
  if (country === "United States") return "US";
  if (country === "Canada") return "CA";
  return "CA";
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts[0] || "Guest", last: parts.slice(1).join(" ") || "Customer" };
}

function isMongoId(value?: string) {
  return /^[a-fA-F0-9]{24}$/.test(String(value || ""));
}

export const placeOrder = createAsyncThunk(
  "orders/place",
  async (
    payload: { draft: OrderDraft; items: CartItem[]; paymentMethod?: "stripe" | "paypal" | "cod" },
    { getState, dispatch, rejectWithValue },
  ) => {
    try {
      const { draft, items, paymentMethod = "cod" } = payload;
      const name = splitName(draft.details.fullName);
      let catalog = (
        getState() as { catalog: { products: { id: string; slug: string }[]; bySlug: Record<string, { id: string; slug: string }> } }
      ).catalog;
      if (!catalog.products.length) {
        await dispatch(fetchShopCatalog());
        catalog = (
          getState() as { catalog: { products: { id: string; slug: string }[]; bySlug: Record<string, { id: string; slug: string }> } }
        ).catalog;
      }

      const orderItems = items
        .map((item) => {
          const fromCatalog =
            catalog.products.find((product) => product.slug === item.slug)?.id || catalog.bySlug[item.slug]?.id;
          const productId = isMongoId(item.productId) ? item.productId : isMongoId(fromCatalog) ? fromCatalog : "";
          return {
            productId,
            slug: item.slug,
            quantity: item.quantity,
            size: item.size,
            custom: Boolean(item.customizable || item.customization),
          };
        })
        .filter((item) => item.productId || item.slug);

      if (!orderItems.length) {
        throw new Error("Your cart products could not be matched. Please add them again, then place the order.");
      }

      const designNotes = items
        .filter((item) => item.customization?.studio === "jersey" || item.customization?.designSummary)
        .map((item) => {
          const summary =
            item.customization?.designSummary || item.customization?.printAreaName || "Jersey studio design";
          return `${item.name} (${item.size}): ${summary} [${item.customization?.customizationId || ""}]`;
        })
        .join("\n");

      const notes = [draft.details.notes, designNotes ? `Jersey designs:\n${designNotes}` : ""]
        .filter(Boolean)
        .join("\n\n");

      const data = await ordersApi.create({
        customerName: draft.details.fullName,
        customerEmail: draft.details.email,
        customerPhone: draft.details.phone,
        paymentMethod,
        notes,
        organization: draft.details.organization,
        neededBy: draft.details.neededBy,
        shipping_address: {
          first_name: name.first,
          last_name: name.last,
          address_line1: draft.details.address1,
          address_line2: draft.details.address2,
          city: draft.details.city,
          state_province: draft.details.region,
          postal_code: draft.details.postalCode,
          country_code: countryCode(draft.details.country),
          phone: draft.details.phone,
          email: draft.details.email,
        },
        items: orderItems,
      });
      return {
        reference: String(data.trackingId || data.order?.trackingId || draft.reference),
        orderId: String(data._id || data.order?._id || ""),
        guestToken: String(data.guestToken || data.order?.guestToken || ""),
      };
    } catch (error) {
      return rejectWithValue(apiMessage(error, "Could not place order"));
    }
  },
);

export const fetchMyOrders = createAsyncThunk("orders/mine", async (_, { rejectWithValue }) => {
  try {
    return await ordersApi.mine();
  } catch (error) {
    return rejectWithValue(apiMessage(error, "Could not load orders"));
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    lastReference: "",
    mine: [] as unknown[],
    loading: false,
    error: "",
  },
  reducers: {
    clearOrderError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.lastReference = action.payload.reference;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Could not place order");
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.mine = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const { clearOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;
