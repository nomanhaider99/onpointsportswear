"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CartItem } from "@/lib/cart";
import { notify } from "@/lib/notify";
import { upsertStudioCartItem } from "@/store/features/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";

function decodeImportPayload(raw: string): CartItem[] {
  const decoded = decodeURIComponent(raw);
  try {
    // UTF-8 payload from customizer encodeCartQuery
    const binary = atob(decoded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as CartItem[];
  } catch {
    // Legacy Latin1 btoa(JSON.stringify(cart))
    return JSON.parse(atob(decoded)) as CartItem[];
  }
}

/** Imports cart lines handed off from the jersey studio (standalone Vite origin). */
export function JerseyCartImport() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const raw = searchParams.get("importJerseyCart");
    if (!raw) return;
    try {
      const parsed = decodeImportPayload(raw);
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
