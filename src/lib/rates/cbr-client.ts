import type { RateTableEntry } from "@/lib/tax/rates/convert";

/** Fetch CBR exchange rates for one date via the app's Route Handler. Returns [] on any error. */
export async function fetchCbrRates(date: string): Promise<RateTableEntry[]> {
  try {
    const res = await fetch(`/api/rates/cbr?date=${encodeURIComponent(date)}`);
    if (!res.ok) return [];
    const data: { date: string; rates: Record<string, number> } = await res.json();
    return Object.entries(data.rates).map(([currency, rateToReport]) => ({
      currency,
      date: data.date,
      rateToReport,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch CBR rates for multiple distinct dates in parallel.
 * Deduplicates dates before fetching; merges all results into a flat array.
 */
export async function fetchCbrRatesForDates(dates: string[]): Promise<RateTableEntry[]> {
  const unique = [...new Set(dates.filter(Boolean))];
  const batches = await Promise.all(unique.map(fetchCbrRates));
  return batches.flat();
}
