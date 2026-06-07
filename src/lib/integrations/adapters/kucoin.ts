import type { TransactionType } from "@/lib/domain/types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { absAmount, mapOperation, normalizeExchangeDate } from "@/lib/integrations/adapter-helpers";

/**
 * KuCoin "Trade History" CSV export adapter.
 *
 * Expected columns: tradeCreatedAt, orderId, symbol, side, price, size,
 * funds, fee, liquidity, feeCurrency, orderType.
 * "symbol" is BASE-QUOTE (e.g. BTC-USDT). "size" is base amount, "funds" is quote amount.
 */
const SIDE_TABLE: ReadonlyArray<[string, TransactionType]> = [
  ["buy", "buy"],
  ["sell", "sell"],
  ["deposit", "deposit"],
  ["withdrawal", "withdrawal"],
  ["transfer", "transfer"],
];

function pick(values: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const found = Object.keys(values).find((k) => k.toLowerCase() === name.toLowerCase());
    if (found !== undefined && values[found] !== undefined) return values[found];
  }
  return "";
}

export const kucoinAdapter: ExchangeAdapter = {
  id: "kucoin",
  label: "KuCoin",
  signatureHeaders: ["tradeCreatedAt", "orderId", "symbol", "side", "price", "size", "funds"],
  mapRow(values): CanonicalRow[] {
    const rawDate = pick(values, "tradeCreatedAt", "createdAt");
    const date = normalizeExchangeDate(rawDate.slice(0, 10));
    const side = pick(values, "side").toLowerCase().trim();
    const symbol = pick(values, "symbol").trim();
    const size = pick(values, "size");
    const price = pick(values, "price");
    const fee = pick(values, "fee");
    const feeCurrency = pick(values, "feeCurrency");

    const parts = symbol.split("-");
    const baseAsset = parts[0]?.trim().toUpperCase() ?? symbol.toUpperCase();
    const quoteAsset = parts[1]?.trim().toUpperCase() ?? "";

    const type = mapOperation(side, SIDE_TABLE);

    const row: CanonicalRow = {
      date,
      type,
      asset: baseAsset,
      amount: absAmount(size),
      price: price || undefined,
      fiat_currency: quoteAsset || undefined,
      fee: fee ? absAmount(fee) : undefined,
      fee_asset: feeCurrency || undefined,
    };
    return [row];
  },
};
