import type { Transaction } from "@/lib/domain/types";
import type { RateTableEntry } from "@/lib/tax/rates/convert";
import { fetchCbrRatesForDates } from "@/lib/rates/cbr-client";
import { fetchCryptoPrice } from "@/lib/rates/prices-client";

export interface FetchRatesResult {
  entries: RateTableEntry[];
  coveredDates: number;
  totalDates: number;
  fetchedAssets: string[];
  skippedAssets: string[];
}

/**
 * Fetch all CBR FX rates for the dates present in the transactions, and then fetch
 * CoinGecko prices (in RUB) for each crypto asset on each date where the transaction
 * lacks a fiatValue. Results are returned as RateTableEntry[] ready for createRateLookup.
 *
 * - FX rates: CBR daily rates for every unique transaction date.
 * - Crypto prices: for assets not recognised as fiat, fetched at RUB price so the engine
 *   can convert proceeds/cost directly into the RU report currency.
 *
 * Missing rates produce no entry (callers mark needs_review; no guessing).
 */
export async function fetchRatesForTransactions(
  transactions: readonly Transaction[],
  reportCurrency = "RUB",
): Promise<FetchRatesResult> {
  const FIAT_CURRENCIES = new Set(["RUB", "USD", "EUR", "GBP", "CNY", "KZT", "BYN", "UAH"]);

  const allDates = [
    ...new Set(
      transactions
        .map((tx) => (tx.date ?? tx.timestamp ?? "").slice(0, 10))
        .filter((d) => d.length === 10),
    ),
  ];

  // 1. Fetch CBR FX rates for all dates.
  const cbrEntries = await fetchCbrRatesForDates(allDates);

  // 2. Find crypto assets that appear in transactions without a fiatValue.
  const assetDatePairs = new Map<string, Set<string>>();
  for (const tx of transactions) {
    const date = (tx.date ?? tx.timestamp ?? "").slice(0, 10);
    if (date.length !== 10) continue;
    const asset = tx.asset.trim().toUpperCase();
    if (FIAT_CURRENCIES.has(asset)) continue;
    const hasFiatValue = tx.fiatValue != null && tx.fiatValue.trim().length > 0;
    if (!hasFiatValue) {
      const dates = assetDatePairs.get(asset) ?? new Set();
      dates.add(date);
      assetDatePairs.set(asset, dates);
    }
  }

  // 3. Fetch crypto prices for missing fiatValue rows (in reportCurrency).
  const cryptoEntries: RateTableEntry[] = [];
  const fetchedAssets: string[] = [];
  const skippedAssets: string[] = [];

  await Promise.all(
    [...assetDatePairs.entries()].map(async ([asset, dates]) => {
      const currency = reportCurrency.toLowerCase();
      const results = await Promise.all(
        [...dates].map(async (date) => {
          const price = await fetchCryptoPrice(asset, date, currency);
          return { date, price };
        }),
      );
      const got = results.filter((r) => r.price !== null);
      if (got.length > 0) {
        for (const { date, price } of got) {
          cryptoEntries.push({ currency: asset, date, rateToReport: price! });
        }
        fetchedAssets.push(asset);
      } else {
        skippedAssets.push(asset);
      }
    }),
  );

  return {
    entries: [...cbrEntries, ...cryptoEntries],
    coveredDates: allDates.filter((d) => cbrEntries.some((e) => e.date === d)).length,
    totalDates: allDates.length,
    fetchedAssets,
    skippedAssets,
  };
}
