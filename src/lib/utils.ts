import { formatMoney, getStoreCurrency, type StoreCurrency } from "@/lib/currency";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function formatPrice(value: number, currency: StoreCurrency = getStoreCurrency()): string {
  return formatMoney(value, currency);
}

export function formatPriceRange(
  min: number,
  max: number,
  currency: StoreCurrency = getStoreCurrency(),
): string {
  if (min === max) return formatPrice(min, currency);
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}
