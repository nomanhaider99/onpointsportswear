export type StoreCurrency = "USD" | "CAD";

const STORAGE_KEY = "op-store-currency";
const CHANGE_EVENT = "op-currency-changed";

const CA_TIMEZONES = /^(America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Montreal|Whitehorse|Yellowknife|Iqaluit|Regina|Moncton|Glace_Bay|Goose_Bay|Blanc-Sablon|Cambridge_Bay|Dawson|Dawson_Creek|Fort_Nelson|Inuvik|Creston|Nipigon|Pangnirtung|Rainy_River|Rankin_Inlet|Resolute|Swift_Current|Thunder_Bay)|Canada\/)/i;

/** Canada → CAD, USA / everything else → USD. */
export function detectStoreCurrency(): StoreCurrency {
  if (typeof window === "undefined") return "USD";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "CAD" || saved === "USD") return saved;
  } catch {
    /* ignore */
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (CA_TIMEZONES.test(tz)) return "CAD";
  } catch {
    /* ignore */
  }

  if (typeof navigator !== "undefined" && /^(en|fr)-CA\b/i.test(navigator.language || "")) {
    return "CAD";
  }

  return "USD";
}

export function getStoreCurrency(): StoreCurrency {
  return detectStoreCurrency();
}

export function setStoreCurrency(currency: StoreCurrency) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function currencyFromCountry(country?: string | null): StoreCurrency {
  const raw = String(country || "").trim().toUpperCase();
  if (raw === "CA" || raw === "CAD" || raw === "CANADA") return "CAD";
  return "USD";
}

export function pickProductAmount(
  product: {
    price?: number;
    salePrice?: number;
    originalPrice?: number;
    priceCad?: number;
    salePriceCad?: number;
    originalPriceCad?: number;
  } | null | undefined,
  currency: StoreCurrency = getStoreCurrency(),
): { amount: number; original: number; currency: StoreCurrency } {
  if (currency === "CAD") {
    const original = Number(
      product?.originalPriceCad ?? product?.priceCad ?? product?.originalPrice ?? product?.price ?? 0,
    );
    const amount = Number(
      product?.salePriceCad ?? product?.priceCad ?? product?.salePrice ?? product?.price ?? original,
    );
    return {
      amount: Number.isFinite(amount) ? amount : 0,
      original: Number.isFinite(original) ? original : 0,
      currency,
    };
  }

  const original = Number(product?.originalPrice ?? product?.price ?? 0);
  const amount = Number(product?.salePrice ?? product?.price ?? original);
  return {
    amount: Number.isFinite(amount) ? amount : 0,
    original: Number.isFinite(original) ? original : 0,
    currency,
  };
}

export function formatMoney(value: number, currency: StoreCurrency = getStoreCurrency()): string {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(currency === "CAD" ? "en-CA" : "en-US", {
      style: "currency",
      currency,
    }).format(safe);
  } catch {
    return `${currency === "CAD" ? "CA$" : "$"}${safe.toFixed(2)}`;
  }
}

export { CHANGE_EVENT as CURRENCY_CHANGE_EVENT };
