"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { authApi, getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) router.replace(accountLoginHref("/account/password"));
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      notify.success("Password updated");
      router.push("/account");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountPageShell title="Change Password">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Current password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          New password
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AccountPageShell>
  );
}
