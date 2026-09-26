"use client";

import Link from "next/link";
import { AccountPageShell } from "@/components/account/AccountChrome";

export default function HelpPage() {
  return (
    <AccountPageShell title="Help & Support">
      <div className="space-y-3">
        <p className="text-sm text-white/70">
          Need help with a custom jersey, order, or your account? Reach the On Point team anytime.
        </p>
        <Link
          href="/contact"
          className="block rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 text-center text-sm font-semibold text-primary"
        >
          Contact support
        </Link>
        <Link
          href="/account/orders"
          className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-center text-sm font-semibold text-white"
        >
          View order history
        </Link>
        <Link
          href="/account/designs"
          className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-center text-sm font-semibold text-white"
        >
          My Designs
        </Link>
      </div>
    </AccountPageShell>
  );
}
