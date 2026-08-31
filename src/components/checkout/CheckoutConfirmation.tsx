"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/data/site";
import { linesMissingArtwork, type OrderDraft } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

/** Success state. The cart is cleared by the time this renders. */
export function CheckoutConfirmation({ draft }: { draft: OrderDraft }) {
  const missing = linesMissingArtwork(draft);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <CheckCircle2 size={34} aria-hidden="true" />
      </span>

      <h2 className="mt-6 text-2xl font-bold uppercase text-white md:text-3xl">
        Order Request Received
      </h2>
      <p className="mt-3 text-base text-white/80">
        Thanks {draft.details.fullName.split(" ")[0]} — we have your request and will be in
        touch at {draft.details.email} within one business day.
      </p>

      <dl className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-sm uppercase tracking-wide text-white/60">Reference</dt>
          <dd className="font-[family-name:var(--font-inter)] text-lg font-bold text-primary">
            {draft.reference}
          </dd>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
          <dt className="text-sm uppercase tracking-wide text-white/60">Items</dt>
          <dd className="text-base text-white">{draft.totals.itemCount}</dd>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-sm uppercase tracking-wide text-white/60">Estimated subtotal</dt>
          <dd className="text-base font-semibold text-primary">
            {formatPrice(draft.totals.subtotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 rounded-xl border border-[var(--color-primary-line)] bg-primary-soft p-6 text-left">
        <h3 className="text-base font-semibold uppercase tracking-wide text-white">
          What happens next
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base text-white/80">
          <li>We review your sizes, artwork and deadline.</li>
          <li>You get a written quote with taxes and shipping confirmed.</li>
          <li>
            {missing.length > 0
              ? "We email you to collect the logo files that were not attached."
              : "We send a digital proof of your design for approval."}
          </li>
          <li>Production starts once you approve — no payment is taken until then.</li>
        </ol>
      </div>

      <p className="mt-6 text-sm text-white/60">
        Questions? Call{" "}
        <a href={siteConfig.phoneHref} className="text-primary underline">
          {siteConfig.phone}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-primary underline">
          {siteConfig.email}
        </a>{" "}
        quoting {draft.reference}.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="rounded-lg bg-primary px-8 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
