"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, getStoredToken, setStoredToken } from "@/lib/api/client";
import { notify } from "@/lib/notify";
import { useAppDispatch } from "@/store/hooks";
import { bootstrapAuth } from "@/store/features/auth/authSlice";

function AccountLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const returnTo = useMemo(() => {
    const raw = searchParams.get("returnTo") || "/cart";
    return raw.startsWith("/") ? raw : "/cart";
  }, [searchParams]);

  const alreadyIn = Boolean(getStoredToken());

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const data = await authApi.login(email.trim(), password);
      if (data.token) setStoredToken(data.token);
      await dispatch(bootstrapAuth());
      notify.success("Signed in");
      router.replace(returnTo);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  if (alreadyIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-white">You are signed in</h1>
        <p className="mt-2 text-sm text-white/70">
          Your designs save to this account on the website and in the app.
        </p>
        <Link
          href={returnTo}
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-white/70">
        Sign in to save jersey designs to your client account, then checkout on the website.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-center text-sm text-white/70">Loading…</div>
      }
    >
      <AccountLoginInner />
    </Suspense>
  );
}
