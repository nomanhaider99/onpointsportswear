import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiMessage, searchApi } from "@/lib/api/client";
import { mapProductList } from "@/lib/api/mapProduct";
import type { Product } from "@/data/products";

export const searchCatalog = createAsyncThunk("search/query", async (q: string, { rejectWithValue }) => {
  try {
    const data = await searchApi.query(q, "products");
    return mapProductList(data.products);
    
  } catch (error) {
    return rejectWithValue(apiMessage(error, "Search failed"));
  }
});

const searchSlice = createSlice({
  name: "search",
  initialState: { q: "", results: [] as Product[], loading: false, error: "" },
  reducers: {
    clearSearch(state) {
      state.q = "";
      state.results = [];
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchCatalog.pending, (state, action) => {
        state.loading = true;
        state.q = action.meta.arg;
        state.error = "";
      })
      .addCase(searchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Search failed");
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
