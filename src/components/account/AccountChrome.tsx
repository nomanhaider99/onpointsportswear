"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountMenuRow({
  href,
  icon,
  label,
  onClick,
  danger = false,
}: {
  href?: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-left transition-colors hover:border-primary/40",
    danger ? "text-[#ff8f8f]" : "text-white",
  );

  const content = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border",
          danger ? "border-[#ff8f8f]/40 text-[#ff8f8f]" : "border-primary/50 text-primary",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-bold">{label}</span>
      {!danger ? <ChevronRight size={16} className="text-white/35" aria-hidden="true" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function AccountPageShell({
  title,
  children,
  backHref = "/account",
}: {
  title: string;
  children: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link href={backHref} className="text-sm font-semibold text-primary hover:underline">
          Back
        </Link>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      {children}
    </div>
  );
}
