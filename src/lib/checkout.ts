"use client";

import type { CartItem, CartKind } from "@/lib/cart";
import { getCustomization, type ProductCustomization } from "@/lib/customization";

/**
 * Checkout data model, validation, and the single seam an order API plugs into.
 *
 * Frontend only, matching the rest of this feature: nothing is persisted, no
 * payment is taken, and `submitOrder` resolves locally until an endpoint is
 * configured. See docs/customizer-handoff.md.
 */

export const COUNTRIES = ["Canada", "United States", "Other"] as const;
export type Country = (typeof COUNTRIES)[number];

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: Country;
  neededBy: string;
  notes: string;
  acceptedTerms: boolean;
}

export const emptyCheckoutDetails: CheckoutDetails = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Canada",
  neededBy: "",
  notes: "",
  acceptedTerms: false,
};

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails, string>>;

/** Region and postcode are named differently per country; labels follow suit. */
export function regionLabel(country: Country): string {
  if (country === "Canada") return "Province";
  if (country === "United States") return "State";
  return "Region";
}

export function postalLabel(country: Country): string {
  return country === "United States" ? "ZIP Code" : "Postal Code";
}

export function validateCheckoutDetails(values: CheckoutDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Please enter your full name.";

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone.trim()) {
    errors.phone = "Please enter a phone number.";
  } else if (digits.length < 7) {
    errors.phone = "Please enter a complete phone number.";
  }

  if (!values.address1.trim()) errors.address1 = "Please enter your street address.";
  if (!values.city.trim()) errors.city = "Please enter your city.";
  if (!values.region.trim()) {
    errors.region = `Please enter your ${regionLabel(values.country).toLowerCase()}.`;
  }
  if (!values.postalCode.trim()) {
    errors.postalCode = `Please enter your ${postalLabel(values.country).toLowerCase()}.`;
  }

  if (values.neededBy) {
    const chosen = new Date(values.neededBy);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) {
      errors.neededBy = "Please enter a valid date.";
    } else if (chosen < today) {
      errors.neededBy = "Please choose a date in the future.";
    }
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "Please accept the terms to place your order.";
  }

  return errors;
}

export interface OrderLine {
  key: string;
  slug: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customizable: boolean;
  printAreaName?: string;
  logoFileName?: string;
  customizationId?: string;
  /** True when the artwork file is no longer in memory (see below). */
  artworkMissing: boolean;
}

export interface OrderDraft {
  reference: string;
  placedAt: string;
  kind: CartKind;
  details: CheckoutDetails;
  lines: OrderLine[];
  /**
   * Full customizer payloads (transform, design space, placements) for the
   * lines that still have them in memory.
   */
  customizations: ProductCustomization[];
  totals: { itemCount: number; subtotal: number };
}

export function createOrderReference(date = new Date()): string {
  const stamp = date.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OP-${stamp}-${suffix}`;
}

/**
 * Assembles the order payload from the cart.
 *
 * Uploaded artwork lives in memory only - deliberately, since persisting
 * customer files is out of scope - so a line added before a page reload keeps
 * its transform summary but loses the file itself. Those lines are flagged
 * rather than silently dropped, so the customer can be told and the backend
 * knows to chase the artwork.
 */
export function buildOrderDraft(
  items: CartItem[],
  details: CheckoutDetails,
  kind: CartKind,
  reference: string,
): OrderDraft {
  const customizations: ProductCustomization[] = [];

  const lines: OrderLine[] = items.map((item) => {
    const id = item.customization?.customizationId;
    const full = id ? getCustomization(id) : undefined;
    if (full) customizations.push(full);

    return {
      key: item.key,
      slug: item.slug,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
      customizable: Boolean(item.customizable),
      printAreaName: item.customization?.printAreaName,
      logoFileName: item.customization?.logoFileName,
      customizationId: id,
      artworkMissing: Boolean(item.customization) && !full,
    };
  });

  return {
    reference,
    placedAt: new Date().toISOString(),
    kind,
    details,
    lines,
    customizations,
    totals: {
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    },
  };
}

export function linesMissingArtwork(draft: OrderDraft): OrderLine[] {
  return draft.lines.filter((line) => line.artworkMissing);
}

/**
 * Single seam for order submission.
 *
 * TODO: Connect to backend/order API. The real implementation belongs behind a
 * Next.js Route Handler so credentials stay server-side (never `NEXT_PUBLIC_*`,
 * which ships to the browser), and it should:
 *   1. upload each customization's logo file (see `UploadedLogo.file`),
 *   2. re-validate the two ordering rules from `@/lib/cart`,
 *   3. re-render the composite from `transform` + `designSpace`,
 *   4. persist the order and return a real reference.
 *
 * No payment is taken here; payment integration is explicitly out of scope for
 * the frontend and belongs with the order API.
 */
export async function submitOrder(draft: OrderDraft): Promise<{ reference: string }> {
  const endpoint = process.env.NEXT_PUBLIC_ORDER_ENDPOINT;

  if (process.env.NODE_ENV === "development") {
    // Makes the payload shape easy to inspect while the backend is being built.
    console.info("[checkout] submitOrder", draft);
  }

  if (!endpoint) {
    // Nothing configured: resolve so the UI can show its confirmation state.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { reference: draft.reference };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  if (!response.ok) {
    throw new Error(`Order submission failed with status ${response.status}`);
  }

  return { reference: draft.reference };
}
