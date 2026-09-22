"use client";

import { CreditCard, Banknote } from "lucide-react";

export type PaymentChoice = "stripe" | "paypal" | "cod";

const OPTIONS: {
  id: PaymentChoice;
  title: string;
  description: string;
  requires: "stripe" | "paypal" | null;
}[] = [
  {
    id: "stripe",
    title: "Pay with Card (Stripe)",
    description: "Visa, Mastercard, Amex and more via Stripe Checkout.",
    requires: "stripe",
  },
  {
    id: "paypal",
    title: "Pay with PayPal",
    description: "Pay securely with your PayPal account.",
    requires: "paypal",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order arrives. No online charge now.",
    requires: null,
  },
];

export function PaymentMethodPicker({
  value,
  onChange,
  enabledMethods,
}: {
  value: PaymentChoice;
  onChange: (method: PaymentChoice) => void;
  enabledMethods: PaymentChoice[];
}) {
  const visible = OPTIONS.filter(
    (option) => !option.requires || enabledMethods.includes(option.id),
  );

  return (
    <section aria-labelledby="payment-method-heading" className="mt-8">
      <h2 id="payment-method-heading" className="text-xl font-bold uppercase text-white">
        Payment method
      </h2>
      <p className="mt-1 text-sm text-white/60">Choose how you want to pay for this order.</p>

      <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Payment method">
        {visible.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-primary bg-primary" : "border-white/40"
                }`}
                aria-hidden
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-black" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-base font-semibold text-white">
                  {option.id === "cod" ? (
                    <Banknote size={18} className="text-primary" aria-hidden />
                  ) : (
                    <CreditCard size={18} className="text-primary" aria-hidden />
                  )}
                  {option.title}
                </span>
                <span className="mt-1 block text-sm text-white/65">{option.description}</span>
              </span>
              {option.id === "paypal" ? (
                <span className="rounded bg-[#003087] px-2 py-1 text-xs font-bold text-white">
                  PayPal
                </span>
              ) : null}
              {option.id === "stripe" ? (
                <span className="rounded bg-[#635BFF] px-2 py-1 text-xs font-bold text-white">
                  Stripe
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
