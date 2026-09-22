"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notify";
import { removeCartItem, upsertStudioCartItem } from "@/store/features/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import type { CartItem } from "@/lib/cart";

const STUDIO_ORIGIN =
  process.env.NEXT_PUBLIC_JERSEY_STUDIO_URL || "http://127.0.0.1:5173";

export function JerseyStudioEmbed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  const iframeSrc = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${STUDIO_ORIGIN}/?${qs}` : `${STUDIO_ORIGIN}/`;
  }, [searchParams]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        cartItem?: CartItem;
        key?: string;
      };
      if (!data || typeof data !== "object" || !data.type) return;

      if (data.type === "op-jersey-add-to-cart" && data.cartItem) {
        dispatch(upsertStudioCartItem(data.cartItem));
        notify.success("Design added to cart");
        return;
      }

      if (data.type === "op-jersey-remove-cart-item" && data.key) {
        dispatch(removeCartItem(data.key));
        return;
      }

      if (data.type === "op-jersey-open-cart") {
        router.push("/cart");
      }
    }

    window.addEventListener("message", onMessage);
    setReady(true);
    return () => window.removeEventListener("message", onMessage);
  }, [dispatch, router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b1020]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-white">
          Jersey Studio
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="rounded-full border border-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary"
          >
            Cart
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>
      {ready ? (
        <iframe
          title="Hockey jersey customizer"
          src={iframeSrc}
          className="h-full w-full flex-1 border-0 bg-[#0b1020]"
          allow="clipboard-write"
        />
      ) : null}
    </div>
  );
}
