import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { catalogApi, apiMessage } from "@/lib/api/client";
import { mapCategories, mapProduct, mapProductList, type ApiCategory, type ApiProduct } from "@/lib/api/mapProduct";
import type { Product } from "@/data/products";

type CatalogState = {
  categories: ApiCategory[];
  products: Product[];
  featured: Product[];
  attributes: unknown[];
  bySlug: Record<string, Product>;
  current: Product | null;
  loading: boolean;
  productLoading: boolean;
  error: string;
};

function indexBySlug(products: Product[]) {
  return Object.fromEntries(products.map((product) => [product.slug, product]));
}

function rejectMessage(error: unknown, fallback: string) {
  return apiMessage(error, fallback);
}

export const fetchShopCatalog = createAsyncThunk("catalog/shop", async (_, { rejectWithValue }) => {
  try {
    // Categories and products separately so a heavy products payload cannot wipe filters.
    const categoriesResult = await catalogApi.categories().catch(() => []);
    const productData = await fetchAllProducts();
    return {
      products: productData,
      categories: mapCategories(categoriesResult),
    };
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Could not load products"));
  }
});

async function fetchAllProducts() {
  const pageSize = 100;
  // lean=true drops huge variant arrays — required or browsers/proxies abort the request.
  const first = await catalogApi.products({ limit: pageSize, page: 1, lean: true });
  let products = mapProductList(first.products);
  const pages = Math.max(1, Number(first.pages) || 1);
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, index) =>
        catalogApi.products({ limit: pageSize, page: index + 2, lean: true }),
      ),
    );
    for (const page of rest) {
      products = products.concat(mapProductList(page.products));
    }
  }
  // De-dupe by id/slug in case of overlap.
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = product.id || product.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const fetchFeatured = createAsyncThunk("catalog/featured", async (_, { rejectWithValue }) => {
  try {
    const data = await catalogApi.products({ featured: "true", limit: 24, lean: true });
    return mapProductList(data.products).filter((product) => product.featured);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Could not load featured products"));
  }
});

export const fetchProductBySlug = createAsyncThunk(
  "catalog/bySlug",
  async (slug: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { catalog: CatalogState };
      const cached = state.catalog.bySlug[slug] || state.catalog.products.find((item) => item.slug === slug);
      if (cached) return cached;

      if (/^[a-f0-9]{24}$/i.test(slug)) {
        return mapProduct((await catalogApi.product(slug)) as unknown as ApiProduct);
      }

      const data = await catalogApi.products({ search: slug, limit: 80 });
      const products = mapProductList(data.products);
      const found = products.find((item) => item.slug === slug);
      if (found) return found;
      throw new Error("Product not found");
    } catch (error) {
      return rejectWithValue(rejectMessage(error, "Product not found"));
    }
  },
);

export const fetchAttributes = createAsyncThunk("catalog/attributes", async (_, { rejectWithValue }) => {
  try {
    const data = await catalogApi.attributes();
    return Array.isArray(data) ? data : (data as { attributes?: unknown[] }).attributes || [];
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Could not load attributes"));
  }
});

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    categories: [],
    products: [],
    featured: [],
    attributes: [],
    bySlug: {},
    current: null,
    loading: false,
    productLoading: false,
    error: "",
  } as CatalogState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopCatalog.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchShopCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.featured = state.products.filter((product) => product.featured);
        state.categories = action.payload.categories;
        state.bySlug = { ...state.bySlug, ...indexBySlug(state.products) };
      })
      .addCase(fetchShopCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Could not load products");
        state.products = [];
        state.featured = [];
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload.length ? action.payload : state.featured;
        state.bySlug = { ...state.bySlug, ...indexBySlug(action.payload) };
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.productLoading = true;
        state.error = "";
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.productLoading = false;
        state.current = action.payload;
        state.bySlug[action.payload.slug] = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.productLoading = false;
        state.current = null;
        state.error = String(action.payload || "Product not found");
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.attributes = action.payload;
      });
  },
});

export default catalogSlice.reducer;
