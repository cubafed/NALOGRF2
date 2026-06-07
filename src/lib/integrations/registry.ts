import type { ExchangeAdapter } from "@/lib/integrations/integration-types";
import { binanceAdapter } from "@/lib/integrations/adapters/binance";
import { bybitAdapter } from "@/lib/integrations/adapters/bybit";

/** All registered exchange CSV adapters. Add new adapters here to make them available. */
export const exchangeAdapters: ExchangeAdapter[] = [binanceAdapter, bybitAdapter];

/** Look up an adapter by its stable id (e.g. "binance"). */
export function getAdapterById(id: string): ExchangeAdapter | null {
  return exchangeAdapters.find((adapter) => adapter.id === id) ?? null;
}

/**
 * Auto-detect the adapter whose signature headers are all present in the given header
 * row (case-insensitive). Returns the first match, or null when none applies.
 */
export function detectAdapter(headers: string[]): ExchangeAdapter | null {
  const present = new Set(headers.map((header) => header.trim().toLowerCase()));
  for (const adapter of exchangeAdapters) {
    const matches = adapter.signatureHeaders.every((header) =>
      present.has(header.toLowerCase()),
    );
    if (matches) return adapter;
  }
  return null;
}
