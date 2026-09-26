"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { accountLoginHref } from "@/lib/auth-gate";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const signedIn = Boolean(token);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border bg-background transition-transform duration-300 lg:hidden",
        open ? "translate-y-0" : "pointer-events-none -translate-y-full",
      )}
      inert={!open}
    >
      <div className="flex items-center justify-end px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded p-1 text-white transition-colors hover:text-primary"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>
      <nav aria-label="Mobile" className="px-5 pb-6">
        <ul className="flex flex-col">
          {mainNav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block border-b border-border py-4 text-base font-semibold uppercase transition-colors",
                    active ? "text-primary" : "text-[#a6a5a5] hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">Account</p>
          {signedIn ? (
            <ul className="flex flex-col gap-1">
              <li className="px-1 py-2 text-sm text-white/70">
                {user?.name || user?.email || "Signed in"}
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="block py-3 text-base font-semibold uppercase text-[#a6a5a5] hover:text-primary"
                >
                  Account home
                </Link>
              </li>
              <li>
                <Link
                  href="/account/designs"
                  onClick={onClose}
                  className="block py-3 text-base font-semibold uppercase text-[#a6a5a5] hover:text-primary"
                >
                  My Designs
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="block py-3 text-base font-semibold uppercase text-[#a6a5a5] hover:text-primary"
                >
                  Order History
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    dispatch(logout());
                    notify.success("Signed out");
                    router.push("/");
                  }}
                  className="block w-full py-3 text-left text-base font-semibold uppercase text-[#ff8f8f]"
                >
                  Sign out
                </button>
              </li>
            </ul>
          ) : (
            <Link
              href={accountLoginHref(pathname || "/")}
              onClick={onClose}
              className="block py-3 text-base font-semibold uppercase text-primary"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
