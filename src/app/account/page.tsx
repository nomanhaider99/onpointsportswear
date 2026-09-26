"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, getStoredToken, setStoredToken } from "@/lib/api/client";
import { JERSEY_STUDIO_URL } from "@/lib/config";
import { notify } from "@/lib/notify";
import { useAppDispatch } from "@/store/hooks";
import { bootstrapAuth } from "@/store/features/auth/authSlice";

function resolveReturnTarget(raw: string, token: string) {
  if (!raw) return { type: "internal" as const, href: "/cart" };
  if (raw.startsWith("/")) return { type: "internal" as const, href: raw };

  try {
    const target = new URL(raw);
    const shopOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const studioOrigin = (JERSEY_STUDIO_URL || "").replace(/\/$/, "");
    let studioHost = "";
    try {
      studioHost = studioOrigin ? new URL(studioOrigin).origin : "";
    } catch {
      studioHost = "";
    }

    if (shopOrigin && target.origin === shopOrigin) {
      return { type: "internal" as const, href: `${target.pathname}${target.search}${target.hash}` };
    }
    if (studioHost && target.origin === studioHost) {
      if (token) target.searchParams.set("token", token);
      if (!target.searchParams.get("embed")) target.searchParams.set("embed", "web");
      return { type: "external" as const, href: target.toString() };
    }
  } catch {
    /* fall through */
  }
  return { type: "internal" as const, href: "/cart" };
}

function AccountLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const returnRaw = searchParams.get("returnTo") || "/cart";

  const alreadyIn = Boolean(getStoredToken());

  async function finishLogin(token: string) {
    const dest = resolveReturnTarget(returnRaw, token);
    if (dest.type === "external") {
      window.location.href = dest.href;
      return;
    }
    router.replace(dest.href);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const data = await authApi.login(email.trim(), password);
      if (data.token) setStoredToken(data.token);
      await dispatch(bootstrapAuth());
      notify.success("Signed in");
      await finishLogin(data.token || getStoredToken());
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  const continueHref = useMemo(() => {
    const token = getStoredToken();
    return resolveReturnTarget(returnRaw, token).href;
  }, [returnRaw]);

  if (alreadyIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-white">You are signed in</h1>
        <p className="mt-2 text-sm text-white/70">
          Your designs save to this account on the website and in the app.
        </p>
        <button
          type="button"
          onClick={() => finishLogin(getStoredToken())}
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Continue
        </button>
        <p className="mt-3 text-xs text-white/40">
          Or go to <Link href="/cart" className="underline">cart</Link>
          {continueHref.startsWith("http") ? null : null}
        </p>
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
