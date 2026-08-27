"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

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
      </nav>
    </div>
  );
}
