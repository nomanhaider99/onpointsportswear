"use client";

import { Check } from "lucide-react";

export type CheckoutStep = "details" | "review" | "confirmation";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "details", label: "Your Details" },
  { id: "review", label: "Review" },
  { id: "confirmation", label: "Confirmation" },
];

/**
 * Progress indicator. Rendered as an ordered list so the sequence and the
 * current position are conveyed by structure and text, not colour alone.
 */
export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done || active
                      ? "bg-primary text-primary-foreground"
                      : "border border-[var(--color-primary-line)] text-white/60"
                  }`}
                >
                  {done ? <Check size={15} /> : index + 1}
                </span>
                <span
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    active ? "text-white" : "text-white/60"
                  }`}
                >
                  {step.label}
                  {active && <span className="sr-only"> (current step)</span>}
                  {done && <span className="sr-only"> (completed)</span>}
                </span>
              </span>
              {index < STEPS.length - 1 && (
                <span aria-hidden="true" className="hidden h-px w-8 bg-border sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
