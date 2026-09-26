"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";
import { updateProfile } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace(accountLoginHref("/account/profile"));
      return;
    }
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
  }, [user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await dispatch(
        updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      ).unwrap();
      notify.success("Profile updated");
      router.push("/account");
    } catch (error) {
      notify.error(typeof error === "string" ? error : "Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountPageShell title="Edit Profile">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </AccountPageShell>
  );
}
