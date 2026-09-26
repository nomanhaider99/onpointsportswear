"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";

export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.replace(accountLoginHref("/account/payments"));
  }, [router]);

  return (
    <AccountPageShell title="Payment Methods">
      <div className="rounded-xl border border-white/10 bg-[#151822] px-4 py-8 text-center">
        <p className="text-sm text-white/70">
          Card and PayPal are entered securely at checkout. Saved payment methods from the app
          sync when you place an order on this account.
        </p>
        <Link
          href="/cart"
          className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Go to cart
        </Link>
      </div>
    </AccountPageShell>
  );
}
