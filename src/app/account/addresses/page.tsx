"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { addressApi, getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";

type AddressRow = {
  _id?: string;
  id?: string;
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
};

export default function AddressesPage() {
  const router = useRouter();
  const [items, setItems] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const data = await addressApi.list();
    const list = Array.isArray(data) ? data : data.addresses || [];
    setItems(list as AddressRow[]);
  }

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace(accountLoginHref("/account/addresses"));
      return;
    }
    refresh()
      .catch((error) => notify.error(error instanceof Error ? error.message : "Could not load addresses"))
      .finally(() => setLoading(false));
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await addressApi.create({ street, city, state, zip, country: "US", label: "Home" });
      setStreet("");
      setCity("");
      setState("");
      setZip("");
      await refresh();
      notify.success("Address saved");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not save address");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountPageShell title="Addresses">
      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <ul className="mb-6 space-y-2">
          {items.length === 0 ? (
            <li className="rounded-lg border border-white/10 px-4 py-6 text-center text-sm text-white/55">
              No saved addresses yet.
            </li>
          ) : (
            items.map((item) => (
              <li
                key={String(item._id || item.id)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85"
              >
                <p className="font-semibold text-white">{item.label || "Address"}</p>
                <p className="mt-1 text-white/60">
                  {[item.street, item.city, item.state, item.zip].filter(Boolean).join(", ")}
                </p>
              </li>
            ))
          )}
        </ul>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
        <p className="text-sm font-semibold text-white">Add address</p>
        <input
          required
          placeholder="Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
          <input
            required
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
        </div>
        <input
          required
          placeholder="ZIP"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save address"}
        </button>
      </form>
    </AccountPageShell>
  );
}
