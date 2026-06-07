import type { RateLookup } from "@/lib/tax/engine/engine-types";

function normalizeCurrency(currency: string | undefined): string {
  return (currency ?? "").trim().toUpperCase();
}

function normalizeDate(date: string | undefined): string {
  // Use the calendar day (YYYY-MM-DD) as the rate key; rates are daily.
  return (date ?? "").trim().slice(0, 10);
}

export interface RateTableEntry {
  currency: string;
  date: string;
  /** 1 unit of `currency` on `date` equals `rateToReport` units of the report currency. */
  rateToReport: number;
}

/**
 * Build a deterministic, date-keyed rate lookup. The report currency always converts
 * 1:1. Unknown currency/date pairs return `null` so callers mark `needs_review` instead
 * of guessing. Once supplied, a rate for a date is fixed (reproducible results).
 */
export function createRateLookup(
  reportCurrency: string,
  entries: readonly RateTableEntry[] = [],
): RateLookup {
  const report = normalizeCurrency(reportCurrency);
  const table = new Map<string, number>();
  for (const entry of entries) {
    const rate = Number(entry.rateToReport);
    if (!Number.isFinite(rate) || rate <= 0) continue;
    table.set(`${normalizeCurrency(entry.currency)}|${normalizeDate(entry.date)}`, rate);
  }

  return {
    reportCurrency: report,
    getRate(currency, date) {
      const cur = normalizeCurrency(currency);
      if (cur.length === 0) return null;
      if (cur === report) return 1;
      const day = normalizeDate(date);
      if (day.length === 0) return null;
      return table.get(`${cur}|${day}`) ?? null;
    },
  };
}

/**
 * Convert `amount` of `currency` on `date` into the report currency.
 * Returns `null` when the amount is not a finite number or no rate is available.
 */
export function convertToReport(
  amount: number | null | undefined,
  currency: string | undefined,
  date: string | undefined,
  rates: RateLookup,
): number | null {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return null;
  }
  const rate = rates.getRate(currency ?? "", date);
  if (rate === null) return null;
  return amount * rate;
}
