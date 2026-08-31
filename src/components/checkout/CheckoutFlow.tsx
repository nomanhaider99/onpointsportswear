"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import {
  buildOrderDraft,
  createOrderReference,
  emptyCheckoutDetails,
  submitOrder,
  validateCheckoutDetails,
  type CheckoutDetails,
  type CheckoutErrors,
  type OrderDraft,
} from "@/lib/checkout";
import { CheckoutConfirmation } from "@/components/checkout/CheckoutConfirmation";
import { CheckoutDetailsForm } from "@/components/checkout/CheckoutDetailsForm";
import { CheckoutReview } from "@/components/checkout/CheckoutReview";
import { CheckoutSteps, type CheckoutStep } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";

/**
 * Checkout controller: details -> review -> confirmation.
 *
 * Steps are local state rather than routes, so a half-filled form is never lost
 * to a navigation. The placed order is held after the cart is cleared so the
 * confirmation can still render.
 */
export function CheckoutFlow() {
  const { items, subtotal, kind, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("details");
  const [values, setValues] = useState<CheckoutDetails>(emptyCheckoutDetails);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [placed, setPlaced] = useState<OrderDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const isFirstStep = useRef(true);

  /*
   * Moving between steps replaces the whole panel, so focus is sent to the top
   * of it - otherwise a keyboard or screen-reader user is left where the old
   * step's controls used to be. An effect rather than requestAnimationFrame,
   * which does not fire while the tab is hidden. Skipped on mount so landing on
   * the page does not steal focus.
   */
  useEffect(() => {
    if (isFirstStep.current) {
      isFirstStep.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const update = useCallback(
    <K extends keyof CheckoutDetails>(field: K, value: CheckoutDetails[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const onDetailsSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validateCheckoutDetails(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setDraft(buildOrderDraft(items, values, kind, createOrderReference()));
      setStep("review");
    },
    [values, items, kind],
  );

  const onPlaceOrder = useCallback(async () => {
    if (!draft) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitOrder(draft);
      setPlaced(draft);
      clearCart();
      setStep("confirmation");
    } catch {
      setSubmitError(
        "We could not place your order just now. Please try again, or call us and quote your items.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [draft, clearCart]);

  const goBackToDetails = useCallback(() => {
    setStep("details");
    setSubmitError(null);
  }, []);

  // Empty cart, and no order just placed: nothing to check out.
  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-lg text-white">Your cart is empty.</p>
        <p className="mt-2 text-base text-white/70">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
        >
          SHOP NOW
        </Link>
      </div>
    );
  }

  if (step === "confirmation" && placed) {
    return (
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        <CheckoutSteps current="confirmation" />
        <div className="mt-10">
          <CheckoutConfirmation draft={placed} />
        </div>
      </div>
    );
  }

  return (
    <div ref={headingRef} tabIndex={-1} className="outline-none">
      <CheckoutSteps current={step} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {step === "details" ? (
            <CheckoutDetailsForm
              values={values}
              errors={errors}
              onChange={update}
              onSubmit={onDetailsSubmit}
            />
          ) : (
            draft && (
              <CheckoutReview
                draft={draft}
                submitting={submitting}
                error={submitError}
                onBack={goBackToDetails}
                onPlaceOrder={onPlaceOrder}
              />
            )
          )}
        </div>

        <OrderSummary items={items} subtotal={subtotal} />
      </div>
    </div>
  );
}
