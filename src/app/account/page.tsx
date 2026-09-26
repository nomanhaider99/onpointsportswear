"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, getStoredToken, setStoredToken } from "@/lib/api/client";
import { JERSEY_STUDIO_URL } from "@/lib/config";
import { notify } from "@/lib/notify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { bootstrapAuth, logout } from "@/store/features/auth/authSlice";

function resolveReturnTarget(raw: string, token: string) {
  if (!raw) return { type: "internal" as const, href: "/account" };
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
      return {
        type: "internal" as const,
        href: `${target.pathname}${target.search}${target.hash}`,
      };
    }
    if (studioHost && target.origin === studioHost) {
      if (token) target.searchParams.set("token", token);
      if (!target.searchParams.get("embed")) target.searchParams.set("embed", "web");
      return { type: "external" as const, href: target.toString() };
    }
  } catch {
    /* fall through */
  }
  return { type: "internal" as const, href: "/account" };
}

function AccountHub() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const returnRaw = searchParams.get("returnTo") || "";

  const continueDest = useMemo(() => {
    if (!returnRaw) return null;
    return resolveReturnTarget(returnRaw, getStoredToken());
  }, [returnRaw]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-white">Account</h1>
      <p className="mt-1 text-sm text-white/70">
        Signed in as {user?.name || user?.email || "member"} — same account as the app.
      </p>

      {continueDest ? (
        <button
          type="button"
          onClick={() => {
            if (continueDest.type === "external") window.location.href = continueDest.href;
            else router.push(continueDest.href);
          }}
          className="mt-6 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Continue to customizer
        </button>
      ) : null}

      <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
        <li>
          <Link
            href="/account/designs"
            className="block px-4 py-3.5 text-sm font-medium text-white hover:bg-white/5 hover:text-primary"
          >
            My Designs
          </Link>
        </li>
        <li>
          <Link
            href="/account/orders"
            className="block px-4 py-3.5 text-sm font-medium text-white hover:bg-white/5 hover:text-primary"
          >
            Order History
          </Link>
        </li>
        <li>
          <Link
            href="/cart"
            className="block px-4 py-3.5 text-sm font-medium text-white hover:bg-white/5 hover:text-primary"
          >
            Cart &amp; checkout
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              notify.success("Signed out");
              router.push("/");
            }}
            className="block w-full px-4 py-3.5 text-left text-sm font-medium text-[#ff8f8f] hover:bg-white/5"
          >
            Sign out
          </button>
        </li>
      </ul>
    </div>
  );
}

function AccountAuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const returnRaw = searchParams.get("returnTo") || "/account";

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
      if (mode === "login") {
        const data = await authApi.login(email.trim(), password);
        if (data.token) setStoredToken(data.token);
        await dispatch(bootstrapAuth());
        notify.success("Signed in");
        await finishLogin(data.token || getStoredToken());
      } else {
        const data = await authApi.register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (data.token) {
          setStoredToken(data.token);
          await dispatch(bootstrapAuth());
          notify.success("Account created");
          await finishLogin(data.token);
        } else {
          notify.success(data.message || "Check your email to finish signup");
          setMode("login");
        }
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Could not continue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-white">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-white/70">
        Same account as the app — save designs, edit later, and checkout on the website.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "login" ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/70"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "register" ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/70"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "register" ? (
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Name
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>
        ) : null}
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
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
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
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

function AccountPageInner() {
  const { token } = useAppSelector((state) => state.auth);
  const signedIn = Boolean(token || getStoredToken());
  return signedIn ? <AccountHub /> : <AccountAuthForms />;
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={<div className="px-4 py-16 text-center text-sm text-white/70">Loading…</div>}
    >
      <AccountPageInner />
    </Suspense>
  );
}
