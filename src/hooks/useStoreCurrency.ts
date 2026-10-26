"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURRENCY_CHANGE_EVENT,
  getStoreCurrency,
  setStoreCurrency,
  type StoreCurrency,
} from "@/lib/currency";

export function useStoreCurrency() {
  const [currency, setCurrency] = useState<StoreCurrency>("USD");

  useEffect(() => {
    setCurrency(getStoreCurrency());
    const onChange = () => setCurrency(getStoreCurrency());
    window.addEventListener(CURRENCY_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((next: StoreCurrency) => {
    setStoreCurrency(next);
    setCurrency(next);
  }, []);

  return { currency, setCurrency: update };
}
