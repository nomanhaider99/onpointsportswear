import { createListenerMiddleware, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { apiMessage } from "@/lib/api/client";
import { notify } from "@/lib/notify";

const SILENT = new Set([
  "auth/bootstrap",
  "catalog/bySlug",
  "orders/mine",
]);

const SUCCESS: Record<string, string | ((payload: unknown) => string)> = {
  "orders/place": (payload) => {
    const row = payload as { reference?: string };
    return row?.reference ? `Order placed. Reference ${row.reference}` : "Order placed successfully.";
  },
  "contact/submit": "Message sent. We will get back to you shortly.",
  "auth/login": "Signed in successfully.",
  "auth/register": "Account created successfully.",
  "auth/forgot": "If that email is registered, we sent reset instructions.",
};

const LOADING: Record<string, string> = {
  "orders/place": "Placing your order…",
  "contact/submit": "Sending your message…",
  "auth/login": "Signing in…",
  "auth/register": "Creating your account…",
  "auth/forgot": "Sending reset email…",
};

const WARN = new Set(["catalog/shop", "catalog/featured"]);

function prefix(type: string) {
  return type.replace(/\/(pending|fulfilled|rejected)$/, "");
}

function payloadMessage(action: { payload?: unknown; error?: { message?: string } }, fallback: string) {
  if (typeof action.payload === "string" && action.payload.trim()) return action.payload;
  return apiMessage(action.payload ?? action.error, fallback);
}

export const toastMiddleware = createListenerMiddleware();

toastMiddleware.startListening({
  matcher: isPending,
  effect: (action) => {
    const key = prefix(action.type);
    if (SILENT.has(key) || !LOADING[key]) return;
    toast.loading(LOADING[key], { id: key });
  },
});

toastMiddleware.startListening({
  matcher: isFulfilled,
  effect: (action) => {
    const key = prefix(action.type);
    if (SILENT.has(key)) return;
    const template = SUCCESS[key];
    if (!template) {
      if (key === "search/query") {
        const results = action.payload as unknown[];
        if (!results?.length) notify.info("No products matched your search.", key);
      }
      toast.dismiss(key);
      return;
    }
    const message = typeof template === "function" ? template(action.payload) : template;
    toast.success(message, { id: key });
  },
});

toastMiddleware.startListening({
  matcher: isRejected,
  effect: (action) => {
    const key = prefix(action.type);
    if (SILENT.has(key)) return;
    const message = payloadMessage(action, "Something went wrong. Please try again.");
    if (WARN.has(key)) {
      notify.warning(message, key);
      return;
    }
    notify.error(message, key);
  },
});
