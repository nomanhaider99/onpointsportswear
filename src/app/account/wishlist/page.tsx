"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { getStoredToken, mediaUrl } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { formatPrice } from "@/lib/utils";

const WISHLIST_KEY = "op-wishlist-v1";

type WishItem = {
  id: string;
  name: string;
  image?: string;
  price?: number;
  slug?: string;
};

function readWishlist(): WishItem[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishItem[]>([]);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace(accountLoginHref("/account/wishlist"));
      return;
    }
    setItems(readWishlist());
  }, [router]);

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  }

  return (
    <AccountPageShell title="Wishlist">
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 px-4 py-10 text-center">
          <p className="text-sm text-white/60">Your wishlist is empty.</p>
          <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#151822] px-3 py-3"
            >
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-white/5">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(item.image) || item.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                {item.price != null ? (
                  <p className="text-xs text-primary">{formatPrice(item.price)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="text-xs font-semibold text-[#ff8f8f]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </AccountPageShell>
  );
}
