"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountPageShell } from "@/components/account/AccountChrome";
import { getStoredToken } from "@/lib/api/client";
import { accountLoginHref } from "@/lib/auth-gate";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.replace(accountLoginHref("/account/settings"));
  }, [router]);

  return (
    <AccountPageShell title="Settings">
      <ul className="space-y-2">
        <li>
          <Link
            href="/account/notifications"
            className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-sm font-semibold text-white hover:border-primary/40"
          >
            Notification preferences
          </Link>
        </li>
        <li>
          <Link
            href="/account/password"
            className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-sm font-semibold text-white hover:border-primary/40"
          >
            Security &amp; password
          </Link>
        </li>
        <li>
          <Link
            href="/privacy-policy"
            className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-sm font-semibold text-white hover:border-primary/40"
          >
            Privacy policy
          </Link>
        </li>
        <li>
          <Link
            href="/terms-of-service"
            className="block rounded-xl border border-white/10 bg-[#151822] px-4 py-3.5 text-sm font-semibold text-white hover:border-primary/40"
          >
            Terms of service
          </Link>
        </li>
      </ul>
    </AccountPageShell>
  );
}
