"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { authApi, getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";
import { bootstrapAuth } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const PREF_KEYS = [
  { id: "orderUpdates", label: "Order updates" },
  { id: "shippingAlerts", label: "Shipping alerts" },
  { id: "promotionalOffers", label: "Promotional offers" },
  { id: "savedDesignReminders", label: "Saved design reminders" },
  { id: "newArrivals", label: "New arrivals" },
] as const;

export default function NotificationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace(accountLoginHref("/account/notifications"));
      return;
    }
    setPrefs({ ...(user?.notificationPrefs || {}) });
  }, [user, router]);

  async function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setBusy(true);
    try {
      await authApi.updateMe({ notificationPrefs: next });
      await dispatch(bootstrapAuth());
      notify.success("Preferences saved");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not save");
      setPrefs({ ...(user?.notificationPrefs || {}) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountPageShell title="Notifications">
      <ul className="space-y-2">
        {PREF_KEYS.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151822] px-4 py-3"
          >
            <span className="text-sm font-medium text-white">{item.label}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle(item.id)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                prefs[item.id] ? "bg-primary" : "bg-white/15"
              }`}
              aria-pressed={Boolean(prefs[item.id])}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  prefs[item.id] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </AccountPageShell>
  );
}
