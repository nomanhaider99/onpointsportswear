"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { designsApi, getStoredToken } from "@/lib/api/client";
import { editSavedDesignHref } from "@/lib/jersey-studio";
import { notify } from "@/lib/notify";
import { formatPrice } from "@/lib/utils";

type SavedDesignRow = {
  _id?: string;
  id?: string;
  name?: string;
  previewUrl?: string;
  size?: string;
  price?: number;
  updatedAt?: string;
  createdAt?: string;
  product?: {
    _id?: string;
    id?: string;
    slug?: string;
    name?: string;
    thumbnail?: string;
    images?: string[];
  };
};

function formatSaved(value?: string) {
  if (!value) return "Saved recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function MyDesignsPage() {
  const [items, setItems] = useState<SavedDesignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const signedIn = Boolean(getStoredToken());

  useEffect(() => {
    let active = true;
    (async () => {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await designsApi.list();
        if (!active) return;
        setItems((data.designs || []) as SavedDesignRow[]);
      } catch (error) {
        if (active) {
          notify.error(error instanceof Error ? error.message : "Could not load designs");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!signedIn) {
    return (
      <div className="container-site py-16 text-center">
        <h1 className="text-2xl font-semibold text-white">My Designs</h1>
        <p className="mt-2 text-sm text-white/70">Sign in to see designs saved to your account.</p>
        <Link
          href="/account?login=1&returnTo=%2Faccount%2Fdesigns"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-site py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Designs</h1>
          <p className="mt-1 text-sm text-white/70">
            Only your account designs. Edit opens the customizer where you left off.
          </p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
          New custom jersey
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-white/60">Loading your designs…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-lg font-medium text-white">No saved designs yet</p>
          <p className="mt-2 text-sm text-white/60">
            Open the customizer, tap Save Design, then edit from here anytime.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const id = String(item._id || item.id || "");
            const thumb = item.previewUrl || item.product?.thumbnail || "/images/logo.png";
            const href = editSavedDesignHref(item);
            return (
              <li
                key={id}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-square bg-[#12141f]">
                  {thumb.startsWith("http") || thumb.startsWith("/") ? (
                    <Image
                      src={thumb}
                      alt={item.name || "Custom design"}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  <p className="font-semibold text-white">{item.name || "Custom Design"}</p>
                  <p className="text-xs text-white/50">{formatSaved(item.updatedAt || item.createdAt)}</p>
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(Number(item.price || 0))}
                    {item.size ? ` · ${item.size}` : ""}
                  </p>
                  <a
                    href={href}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Edit design
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
