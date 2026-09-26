"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

export function AccountMenu({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const signedIn = Boolean(token);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!signedIn) {
    return (
      <Link
        href={accountLoginHref(pathname || "/")}
        aria-label="Sign in"
        className={cn(
          "inline-flex rounded border border-transparent p-2 text-white transition-colors hover:text-primary",
          className,
        )}
      >
        <User size={22} aria-hidden="true" />
        <span className="sr-only">Sign in</span>
      </Link>
    );
  }

  const initial = String(user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold text-white transition-colors hover:border-primary hover:text-primary"
      >
        {initial}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#12141f] shadow-xl"
        >
          <div className="border-b border-white/10 px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">{user?.name || "Member"}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-primary"
          >
            Account
          </Link>
          <Link
            href="/account/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-primary"
          >
            Edit Profile
          </Link>
          <Link
            href="/account/designs"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-primary"
          >
            My Designs
          </Link>
          <Link
            href="/account/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-primary"
          >
            Order History
          </Link>
          <Link
            href="/account/wishlist"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-white/85 hover:bg-white/5 hover:text-primary"
          >
            Wishlist
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              dispatch(logout());
              notify.success("Signed out");
              router.push("/");
            }}
            className="flex w-full items-center gap-2 border-t border-white/10 px-3 py-2.5 text-left text-sm text-[#ff8f8f] hover:bg-white/5"
          >
            <LogOut size={14} aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
