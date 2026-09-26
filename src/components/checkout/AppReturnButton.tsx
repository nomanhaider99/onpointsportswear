"use client";

import { bounceToApp, buildAppReturnHref } from "@/lib/app-return";

export function AppReturnButton({
  appReturn,
  orderId,
  paid,
  label = "Return to app",
}: {
  appReturn: string;
  orderId?: string;
  paid?: boolean;
  label?: string;
}) {
  if (!appReturn) return null;
  const href = buildAppReturnHref(appReturn, { orderId, paid });

  return (
    <a
      href={href}
      className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-primary-foreground"
      onClick={(event) => {
        event.preventDefault();
        bounceToApp(appReturn, { orderId, paid });
      }}
    >
      {label}
    </a>
  );
}
