"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { Product } from "@/data/products";
import { getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { jerseyStudioHref } from "@/lib/jersey-studio";
import { notify } from "@/lib/notify";

type Props = {
  product: Product;
  size?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Opens the jersey customizer only when the customer is signed in
 * (same gate as the mobile app).
 */
export function CustomizeStudioButton({ product, size, className, children }: Props) {
  const router = useRouter();

  function openStudio() {
    const studioUrl = jerseyStudioHref(product, { size, token: getStoredToken() || undefined });
    const token = getStoredToken();
    if (!token) {
      notify.info("Sign in to open the customizer and save your designs");
      router.push(accountLoginHref(studioUrl));
      return;
    }
    window.location.href = studioUrl;
  }

  return (
    <button type="button" onClick={openStudio} className={className}>
      {children ?? (
        <>
          <Sparkles size={16} aria-hidden="true" />
          Customize This Product
        </>
      )}
    </button>
  );
}
