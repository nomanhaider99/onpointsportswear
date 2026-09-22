import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import catalogReducer from "./features/catalog/catalogSlice";
import cartReducer from "./features/cart/cartSlice";
import ordersReducer from "./features/orders/ordersSlice";
import contactReducer from "./features/contact/contactSlice";
import searchReducer from "./features/search/searchSlice";
import { toastMiddleware } from "./toastMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    cart: cartReducer,
    orders: ordersReducer,
    contact: contactReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(toastMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
