"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { bootstrapAuth } from "./features/auth/authSlice";
import { hydrateCart } from "./features/cart/cartSlice";

function Bootstrap() {
  useEffect(() => {
    store.dispatch(hydrateCart());
    store.dispatch(bootstrapAuth());
  }, []);
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Bootstrap />
      {children}
    </Provider>
  );
}
