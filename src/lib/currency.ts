export type CrochetCurrency = "INR" | "USD";

const INDIAN_TIMEZONES = new Set([
  "Asia/Kolkata",
  "Asia/Calcutta",
  "IST",
  "Asia/Delhi",
]);

export function detectCurrency(): CrochetCurrency {
  if (typeof window === "undefined") return "USD";

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (INDIAN_TIMEZONES.has(timeZone)) return "INR";
  } catch {
    /* ignore */
  }

  const languages = navigator.languages ?? [navigator.language];
  for (const locale of languages) {
    if (locale?.toLowerCase().startsWith("en-in") || locale?.toLowerCase().startsWith("hi")) {
      return "INR";
    }
  }

  return "USD";
}

/**
 * Market-adjusted rate, not the FX rate: handmade crochet sells far cheaper in
 * India, so a $24 piece lands around ₹480 rather than ₹2,000.
 */
const INR_PER_USD = 20;

/** Convert an amount between the two supported markets. */
export function convertPrice(
  amount: number,
  from: CrochetCurrency,
  to: CrochetCurrency,
): number {
  if (from === to || !amount) return amount;
  const raw = from === "USD" ? amount * INR_PER_USD : amount / INR_PER_USD;
  if (to === "INR") return Math.max(50, Math.round(raw / 50) * 50);
  return Math.max(1, Math.round(raw));
}

export function formatPrice(amount: number, currency: CrochetCurrency): string {

  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currencySymbol(currency: CrochetCurrency): string {
  return currency === "INR" ? "₹" : "$";
}

export function currencyLabel(currency: CrochetCurrency): string {
  return currency === "INR" ? "Indian Rupee (INR)" : "US Dollar (USD)";
}
