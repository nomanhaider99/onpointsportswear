"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredToken, ordersApi } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";
import { formatPrice } from "@/lib/utils";

type OrderRow = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  createdAt?: string;
  items?: unknown[];
};

export default function AccountOrdersPage() {
  const [items, setItems] = useState<OrderRow[]>([]);
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
        const data = await ordersApi.mine();
        if (!active) return;
        setItems(Array.isArray(data) ? (data as OrderRow[]) : []);
      } catch (error) {
        if (active) {
          notify.error(error instanceof Error ? error.message : "Could not load orders");
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
        <h1 className="text-2xl font-semibold text-white">Order History</h1>
        <p className="mt-2 text-sm text-white/70">Sign in to see your orders.</p>
        <Link
          href={accountLoginHref("/account/orders")}
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
          <h1 className="text-2xl font-semibold text-white">Order History</h1>
          <p className="mt-1 text-sm text-white/70">Orders placed with this account (website &amp; app).</p>
        </div>
        <Link href="/account" className="text-sm font-semibold text-primary hover:underline">
          Back to account
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-white/60">Loading orders…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-lg font-medium text-white">No orders yet</p>
          <p className="mt-2 text-sm text-white/60">When you checkout, your orders show up here.</p>
          <Link href="/products" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((order) => {
            const id = String(order._id || order.id || "");
            const when = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "";
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-white">
                    {order.orderNumber || `Order ${id.slice(-6)}`}
                  </p>
                  <p className="text-xs text-white/50">
                    {when}
                    {order.status ? ` · ${order.status}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(Number(order.total || 0))}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
