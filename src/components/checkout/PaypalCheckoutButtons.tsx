"use client";

import { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { paymentsApi } from "@/lib/api/client";
import { notify } from "@/lib/notify";

/** PayPal Buttons for an already-created store order. */
export function PaypalCheckoutButtons({
  orderId,
  guestToken,
  clientId,
  currency = "USD",
  onPaid,
  onError,
}: {
  orderId: string;
  guestToken?: string;
  clientId: string;
  currency?: string;
  onPaid: () => void;
  onError: (message: string) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(Boolean(clientId && orderId));
  }, [clientId, orderId]);

  if (!ready) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm text-white/70">Complete payment with PayPal:</p>
      <PayPalScriptProvider
        options={{
          clientId,
          currency,
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
          createOrder={async () => {
            const origin = window.location.origin;
            const data = await paymentsApi.paypalCreate({
              orderId,
              guestToken,
              returnUrl: `${origin}/checkout/success?orderId=${orderId}`,
              cancelUrl: `${origin}/checkout?cancelled=1&orderId=${orderId}`,
            });
            return data.paypalOrderId;
          }}
          onApprove={async (data) => {
            try {
              await paymentsApi.paypalCapture({
                orderId,
                guestToken,
                paypalOrderId: data.orderID,
              });
              notify.success("Payment successful");
              onPaid();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "PayPal capture failed";
              onError(message);
            }
          }}
          onError={() => onError("PayPal checkout failed. Please try again.")}
          onCancel={() => onError("PayPal payment was cancelled.")}
        />
      </PayPalScriptProvider>
    </div>
  );
}
