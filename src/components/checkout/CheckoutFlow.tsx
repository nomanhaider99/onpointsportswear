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
import { paymentsApi, type PaymentMethodId } from "@/lib/api/client";
import { CheckoutConfirmation } from "@/components/checkout/CheckoutConfirmation";
import { CheckoutDetailsForm } from "@/components/checkout/CheckoutDetailsForm";
import { CheckoutReview } from "@/components/checkout/CheckoutReview";
import { CheckoutSteps, type CheckoutStep } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { PaymentChoice } from "@/components/checkout/PaymentMethodPicker";
import { notify } from "@/lib/notify";
import { markJerseyStudioCartForClear } from "@/lib/jersey-cart-clear";

/**
 * Checkout controller: details -> review -> confirmation.
 * Review includes Stripe / PayPal / COD payment choice.
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("stripe");
  const [enabledMethods, setEnabledMethods] = useState<PaymentChoice[]>(["cod"]);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [pendingPaypal, setPendingPaypal] = useState<{
    orderId: string;
    guestToken?: string;
  } | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const isFirstStep = useRef(true);

  useEffect(() => {
    paymentsApi
      .config()
      .then((config) => {
        const methods = (config.methods || []).filter(Boolean) as PaymentChoice[];
        setEnabledMethods(methods.length ? methods : ["cod"]);
        setPaypalClientId(config.paypalClientId || "");
        setCurrency(config.currency || "USD");
        const preferred = (["stripe", "paypal", "cod"] as PaymentMethodId[]).find((id) =>
          methods.includes(id as PaymentChoice),
        );
        if (preferred) setPaymentMethod(preferred as PaymentChoice);
      })
      .catch((err) => {
        console.warn("[checkout] payments/config failed — showing COD only", err);
        setEnabledMethods(["cod"]);
        setPaymentMethod("cod");
      });
  }, []);

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

  const finishPlaced = useCallback(
    (nextDraft: OrderDraft) => {
      setPlaced(nextDraft);
      clearCart({ silent: true });
      markJerseyStudioCartForClear();
      setPendingPaypal(null);
      setStep("confirmation");
    },
    [clearCart],
  );

  const onDetailsSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validateCheckoutDetails(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        const first = Object.values(nextErrors)[0];
        if (first) notify.error(first);
        return;
      }

      setDraft(buildOrderDraft(items, values, kind, createOrderReference()));
      setPendingPaypal(null);
      setSubmitError(null);
      setStep("review");
    },
    [values, items, kind],
  );

  const onPlaceOrder = useCallback(async () => {
    if (!draft) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitOrder(draft, paymentMethod);

      if (paymentMethod === "cod") {
        finishPlaced({ ...draft, reference: result.reference });
        return;
      }

      if (paymentMethod === "stripe") {
        const origin = window.location.origin;
        const guestToken = String(result.guestToken || "");
        if (!result.orderId) {
          throw new Error("Order was created but no order id was returned. Please try again.");
        }
        const session = await paymentsApi.stripeCheckoutSession({
          orderId: result.orderId,
          guestToken,
          successUrl: `${origin}/checkout/success?orderId={ORDER_ID}&guest=${encodeURIComponent(guestToken)}`,
          cancelUrl: `${origin}/checkout?cancelled=1&orderId={ORDER_ID}`,
        });
        if (!session.url) throw new Error("Stripe checkout URL missing");
        clearCart({ silent: true });
        markJerseyStudioCartForClear();
        window.location.href = session.url;
        return;
      }

      if (paymentMethod === "paypal") {
        setPendingPaypal({
          orderId: result.orderId,
          guestToken: String(result.guestToken || ""),
        });
        notify.success("Order created — complete PayPal payment below.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setSubmitError(
        message && !/failed to fetch|network/i.test(message)
          ? message
          : "We could not place your order just now. Please try again, or call us and quote your items.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [draft, paymentMethod, finishPlaced, clearCart]);

  const goBackToDetails = useCallback(() => {
    setStep("details");
    setSubmitError(null);
    setPendingPaypal(null);
  }, []);

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
                paymentMethod={paymentMethod}
                enabledMethods={enabledMethods}
                paypalClientId={paypalClientId}
                currency={currency}
                pendingPaypal={pendingPaypal}
                onPaymentMethodChange={(method) => {
                  setPaymentMethod(method);
                  setPendingPaypal(null);
                  setSubmitError(null);
                }}
                onBack={goBackToDetails}
                onPlaceOrder={onPlaceOrder}
                onPaypalPaid={() => {
                  if (!draft) return;
                  finishPlaced(draft);
                }}
                onPaypalError={(message) => setSubmitError(message)}
              />
            )
          )}
        </div>

        <OrderSummary items={items} subtotal={subtotal} />
      </div>
    </div>
  );
}
