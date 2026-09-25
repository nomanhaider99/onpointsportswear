"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JERSEY_STUDIO_URL } from "@/lib/config";
import { designsApi, getStoredToken, uploadCustomPreview } from "@/lib/api/client";
import { notify } from "@/lib/notify";
import { removeCartItem, upsertStudioCartItem } from "@/store/features/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import type { CartItem } from "@/lib/cart";

const STUDIO_ORIGIN = JERSEY_STUDIO_URL;

type StudioMessage = {
  type?: string;
  cartItem?: CartItem;
  key?: string;
  previewDataUrl?: string;
  design?: { id?: string; name?: string; state?: unknown; previewDataUrl?: string };
  product?: { id?: string; _id?: string; size?: string; price?: number; name?: string };
};

async function persistStudioDesign(data: StudioMessage) {
  const token = getStoredToken();
  if (!token) {
    notify.error("Sign in to save designs to your account");
    return null;
  }
  const previewRaw = data.previewDataUrl || data.design?.previewDataUrl || "";
  let previewUrl = "";
  if (previewRaw) {
    previewUrl = await uploadCustomPreview(previewRaw);
  }
  const productId = data.product?.id || data.product?._id || data.cartItem?.productId || "studio-jersey";
  return designsApi.create({
    productId,
    name: data.design?.name || data.product?.name || "Custom Design",
    previewUrl,
    size: data.product?.size || data.cartItem?.size || "",
    price: Number(data.product?.price || data.cartItem?.price || 0),
    designState: data.design?.state || null,
    customization: { studio: "jersey", designId: data.design?.id },
    studio: "jersey",
  });
}

export function JerseyStudioEmbed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  const iframeSrc = useMemo(() => {
    if (!STUDIO_ORIGIN) return "";
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("embed")) params.set("embed", "web");
    const token = getStoredToken();
    if (token && !params.has("token")) params.set("token", token);
    const qs = params.toString();
    return qs ? `${STUDIO_ORIGIN}/?${qs}` : `${STUDIO_ORIGIN}/?embed=web`;
  }, [searchParams]);

  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const data = event.data as StudioMessage & { source?: string; reason?: string };
      if (!data || typeof data !== "object" || !data.type) return;

      if (data.type === "op-jersey-request-login") {
        notify.error("Sign in to save designs to your account");
        router.push(`/account?login=1&returnTo=${encodeURIComponent("/customize/jersey")}`);
        return;
      }

      if (data.type === "op-jersey-save-design") {
        try {
          await persistStudioDesign(data);
          notify.success("Design saved to your account");
        } catch (error) {
          notify.error(error instanceof Error ? error.message : "Could not save design");
        }
        return;
      }

      if (data.type === "op-jersey-add-to-cart" && data.cartItem) {
        let line = data.cartItem;
        const previewRaw = data.previewDataUrl || data.design?.previewDataUrl || "";
        try {
          if (getStoredToken()) {
            const saved = await persistStudioDesign(data);
            const previewUrl =
              (saved?.previewUrl as string) ||
              (previewRaw.startsWith("http") ? previewRaw : "");
            if (previewUrl) {
              line = {
                ...line,
                image: previewUrl,
                customization: {
                  customizationId:
                    line.customization?.customizationId || `jersey-${Date.now()}`,
                  printAreaId: line.customization?.printAreaId || "jersey",
                  printAreaName: line.customization?.printAreaName || "Jersey",
                  transform: line.customization?.transform || {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    rotation: 0,
                  },
                  ...(line.customization || {}),
                  previewUrl,
                  studio: "jersey",
                },
              };
            }
          } else if (previewRaw && !previewRaw.startsWith("data:")) {
            line = {
              ...line,
              image: previewRaw,
              customization: {
                customizationId:
                  line.customization?.customizationId || `jersey-${Date.now()}`,
                printAreaId: line.customization?.printAreaId || "jersey",
                printAreaName: line.customization?.printAreaName || "Jersey",
                transform: line.customization?.transform || {
                  x: 0,
                  y: 0,
                  width: 1,
                  height: 1,
                  rotation: 0,
                },
                ...(line.customization || {}),
                previewUrl: previewRaw,
                studio: "jersey",
              },
            };
          } else if (previewRaw.startsWith("data:")) {
            try {
              const uploaded = await uploadCustomPreview(previewRaw);
              if (uploaded) {
                line = {
                  ...line,
                  image: uploaded,
                  customization: {
                    ...(line.customization || {
                      customizationId: `jersey-${Date.now()}`,
                      printAreaId: "jersey",
                      printAreaName: "Jersey",
                      transform: { x: 0, y: 0, width: 1, height: 1, rotation: 0 },
                    }),
                    previewUrl: uploaded,
                    studio: "jersey",
                  },
                };
              }
            } catch {
              /* guest cart without preview */
            }
          }
        } catch {
          if (previewRaw && previewRaw.startsWith("http")) {
            line = { ...line, image: previewRaw };
          }
        }
        dispatch(upsertStudioCartItem(line));
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
      {ready && iframeSrc ? (
        <iframe
          title="Hockey jersey customizer"
          src={iframeSrc}
          className="h-full w-full flex-1 border-0 bg-[#0b1020]"
          allow="clipboard-write"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-white/70">
          Set <code className="mx-1 text-white">NEXT_PUBLIC_JERSEY_STUDIO_URL</code> in{" "}
          <code className="mx-1 text-white">onpointsportswear/.env</code> and restart the site.
        </div>
      )}
    </div>
  );
}
