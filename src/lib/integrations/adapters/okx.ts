import type { TransactionType } from "@/lib/domain/types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { absAmount, mapOperation, normalizeExchangeDate } from "@/lib/integrations/adapter-helpers";

/**
 * OKX "Trade History" export adapter.
 *
 * Expected columns: Order Time, Instrument Name, Trade ID, Side, Fill Quantity,
 * Fill Price, Fee, Fee Currency, Fill pnl (the last two optional).
 * OKX also exports a "Funding History" (different columns) — both share "Order Time".
 *
 * Column aliases handled: OKX sometimes uses "Timestamp" instead of "Order Time".
 */
const SIDE_TABLE: ReadonlyArray<[string, TransactionType]> = [
  ["buy", "buy"],
  ["sell", "sell"],
  ["deposit", "deposit"],
  ["withdrawal", "withdrawal"],
  ["transfer", "transfer"],
  ["earn", "income"],
  ["staking", "income"],
];

function pick(values: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const found = Object.keys(values).find((k) => k.toLowerCase() === name.toLowerCase());
    if (found !== undefined && values[found] !== undefined) return values[found];
  }
  return "";
}

export const okxAdapter: ExchangeAdapter = {
  id: "okx",
  label: "OKX",
  signatureHeaders: ["Order Time", "Instrument Name", "Trade ID", "Side", "Fill Quantity"],
  mapRow(values): CanonicalRow[] {
    const rawDate = pick(values, "Order Time", "Timestamp");
    const date = normalizeExchangeDate(rawDate.replace(/\//g, "-"));
    const side = pick(values, "Side").toLowerCase().trim();
    const instrument = pick(values, "Instrument Name").trim();
    const fillQty = pick(values, "Fill Quantity", "Qty");
    const fillPrice = pick(values, "Fill Price", "Price");
    const fee = pick(values, "Fee");
    const feeCurrency = pick(values, "Fee Currency");

    // Derive asset from instrument: BTC-USDT → BTC for buy, USDT for sell
    const parts = instrument.split("-");
    const baseAsset = parts[0]?.trim().toUpperCase() ?? instrument.toUpperCase();
    const quoteAsset = parts[1]?.trim().toUpperCase() ?? "";

    const type = mapOperation(side, SIDE_TABLE);
    const amount = absAmount(fillQty);

    const row: CanonicalRow = {
      date,
      type,
      asset: baseAsset,
      amount,
      price: fillPrice || undefined,
      fiat_currency: quoteAsset || undefined,
      fee: fee ? absAmount(fee) : undefined,
      fee_asset: feeCurrency || undefined,
    };
    return [row];
  },
};
