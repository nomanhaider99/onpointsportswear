"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CreditCard,
  Heart,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  Palette,
  Receipt,
  Settings,
  User,
} from "lucide-react";
import { AccountMenuRow } from "@/components/account/AccountChrome";
import { authApi, getStoredToken, mediaUrl, setStoredToken } from "@/lib/api/client";
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
  const [confirmOut, setConfirmOut] = useState(false);

  const continueDest = useMemo(() => {
    if (!returnRaw) return null;
    return resolveReturnTarget(returnRaw, getStoredToken());
  }, [returnRaw]);

  const avatar = mediaUrl(user?.avatar);
  const initial = String(user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-wider text-white/45">Profile</p>
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#1b2230] text-2xl font-extrabold text-primary">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <p className="mt-3 text-lg font-extrabold text-white">{user?.name || "Member"}</p>
        <p className="text-sm text-white/55">{user?.email}</p>
      </div>

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

      <div className="mt-8 flex flex-col gap-2.5">
        <AccountMenuRow href="/account/profile" icon={<User size={18} />} label="Edit Profile" />
        <AccountMenuRow href="/account/settings" icon={<Settings size={18} />} label="Settings" />
        <AccountMenuRow href="/account/notifications" icon={<Bell size={18} />} label="Notifications" />
        <AccountMenuRow href="/account/password" icon={<Lock size={18} />} label="Change Password" />
        <AccountMenuRow href="/account/addresses" icon={<MapPin size={18} />} label="Addresses" />
        <AccountMenuRow href="/account/payments" icon={<CreditCard size={18} />} label="Payment Methods" />
        <AccountMenuRow href="/account/wishlist" icon={<Heart size={18} />} label="Wishlist" />
        <AccountMenuRow href="/account/designs" icon={<Palette size={18} />} label="My Designs" />
        <AccountMenuRow href="/account/orders" icon={<Receipt size={18} />} label="Order History" />
        <AccountMenuRow href="/account/help" icon={<HelpCircle size={18} />} label="Help & Support" />
        <AccountMenuRow
          icon={<LogOut size={18} />}
          label="Log Out"
          danger
          onClick={() => setConfirmOut(true)}
        />
      </div>

      {confirmOut ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#151822] p-5 text-center">
            <p className="text-lg font-bold text-white">Log Out</p>
            <p className="mt-2 text-sm text-white/60">Are you sure you want to leave your account?</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOut(false)}
                className="flex-1 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOut(false);
                  dispatch(logout());
                  notify.success("Signed out");
                  router.push("/");
                }}
                className="flex-1 rounded-lg bg-[#d9534f] px-3 py-2.5 text-sm font-semibold text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
        Same account as the app — designs, orders, and profile sync across website and mobile.
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
      <p className="mt-4 text-center text-xs text-white/40">
        Or browse <Link href="/products" className="text-primary underline">products</Link> without
        an account.
      </p>
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
