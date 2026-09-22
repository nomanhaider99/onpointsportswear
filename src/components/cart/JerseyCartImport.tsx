"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CartItem } from "@/lib/cart";
import { notify } from "@/lib/notify";
import { upsertStudioCartItem } from "@/store/features/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";

/** Imports cart lines handed off from the jersey studio (standalone Vite origin). */
export function JerseyCartImport() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const raw = searchParams.get("importJerseyCart");
    if (!raw) return;
    try {
      const parsed = JSON.parse(atob(decodeURIComponent(raw))) as CartItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      for (const item of parsed) {
        if (item?.key && item?.slug) dispatch(upsertStudioCartItem(item));
      }
      notify.success("Jersey designs imported into your cart");
      router.replace("/cart");
    } catch {
      notify.error("Could not import jersey cart");
      router.replace("/cart");
    }
  }, [searchParams, dispatch, router]);

  return null;
}
