"use client";

import Link from "next/link";
import { AlertTriangle, Pencil } from "lucide-react";
import { linesMissingArtwork, postalLabel, regionLabel, type OrderDraft } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

/** Read-back of everything being ordered, plus the place-order action. */
export function CheckoutReview({
  draft,
  submitting,
  error,
  onBack,
  onPlaceOrder,
}: {
  draft: OrderDraft;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const { details } = draft;
  const missing = linesMissingArtwork(draft);

  return (
    <div>
      {/*
        Artwork lives in memory only, so a line added before a page reload keeps
        its placement but loses the file. Say so plainly rather than letting the
        customer assume their logo is attached.
      */}
      {missing.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex gap-3 rounded-lg border border-[#ffb95e]/40 bg-[#ffb95e]/10 p-4"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#ffb95e]" aria-hidden="true" />
          <div className="text-sm text-white">
            <p className="font-semibold text-[#ffb95e]">Your logo file needs re-attaching</p>
            <p className="mt-1 text-white/80">
              Uploaded artwork is not stored between visits, so the file for{" "}
              {missing.map((line) => line.name).join(", ")} is no longer attached. The
              placement and sizing are still saved. Re-open the product to re-apply your
              logo, or place the order and we will email you to collect the artwork.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {missing.map((line) => (
                <Link
                  key={line.key}
                  href={`/products/${line.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-line)] px-3 py-2 text-sm text-white transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Pencil size={14} aria-hidden="true" />
                  Re-apply on {line.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <section aria-labelledby="review-contact">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="review-contact" className="text-xl font-bold uppercase text-white">
            Contact & Delivery
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-white/70 underline transition-colors hover:text-primary"
          >
            Edit details
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-white/60">Name</dt>
            <dd className="text-base text-white">{details.fullName}</dd>
          </div>
          {details.organization && (
            <div>
              <dt className="text-sm text-white/60">Team / Organization</dt>
              <dd className="text-base text-white">{details.organization}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-white/60">Email</dt>
            <dd className="break-words text-base text-white">{details.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-white/60">Phone</dt>
            <dd className="text-base text-white">{details.phone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-white/60">Delivery address</dt>
            <dd className="text-base text-white">
              {details.address1}
              {details.address2 && `, ${details.address2}`}
              <br />
              {details.city}, {details.region} {details.postalCode}
              <br />
              {details.country}
              <span className="sr-only">
                {" "}
                ({regionLabel(details.country)} and {postalLabel(details.country)})
              </span>
            </dd>
          </div>
          {details.neededBy && (
            <div>
              <dt className="text-sm text-white/60">Needed by</dt>
              <dd className="text-base text-white">{details.neededBy}</dd>
            </div>
          )}
          {details.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-white/60">Notes</dt>
              <dd className="whitespace-pre-line text-base text-white">{details.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      <section aria-labelledby="review-items" className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="review-items" className="text-xl font-bold uppercase text-white">
            Items
          </h2>
          <Link
            href="/cart"
            className="text-sm text-white/70 underline transition-colors hover:text-primary"
          >
            Edit cart
          </Link>
        </div>

        <ul className="mt-4 space-y-3">
          {draft.lines.map((line) => (
            <li
              key={line.key}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="text-base text-white">
                  {line.name}{" "}
                  <span className="text-white/60">
                    × {line.quantity} · Size {line.size}
                  </span>
                </p>
                {line.customizable && (
                  <p className="mt-1 text-sm text-primary">
                    Custom logo · {line.printAreaName}
                    {line.logoFileName && ` · ${line.logoFileName}`}
                    {line.artworkMissing && (
                      <span className="text-[#ffb95e]"> · file not attached</span>
                    )}
                  </p>
                )}
              </div>
              <p className="text-base font-semibold text-primary">
                {formatPrice(line.lineTotal)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ff6b6b]"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={submitting}
          className="rounded-lg bg-primary px-8 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary"
        >
          {submitting ? "Placing order…" : "Place Order"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>
      </div>

      <p className="mt-4 text-sm text-white/60">
        Placing an order sends your request to our team. No payment is taken now — we will
        confirm pricing, taxes and shipping before anything is charged.
      </p>
    </div>
  );
}
