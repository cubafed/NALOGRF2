import type { TransactionType } from "@/lib/domain/types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { absAmount, mapOperation, normalizeExchangeDate } from "@/lib/integrations/adapter-helpers";

/**
 * Kraken "Ledgers" CSV export adapter.
 *
 * Expected columns: txid, refid, time, type, subtype, aclass, asset, amount, fee, balance.
 * "type" values: deposit, withdrawal, trade, spend, receive, transfer, earn, staking.
 * Kraken asset codes use prefixes: XXBT → BTC, XETH → ETH, ZUSD → USD, ZEUR → EUR.
 */
const TYPE_TABLE: ReadonlyArray<[string, TransactionType]> = [
  ["deposit", "deposit"],
  ["withdrawal", "withdrawal"],
  ["trade", "buy"],
  ["spend", "sell"],
  ["sell", "sell"],
  ["receive", "buy"],
  ["buy", "buy"],
  ["transfer", "transfer"],
  ["earn", "income"],
  ["staking", "income"],
  ["reward", "income"],
];

const ASSET_ALIASES: Record<string, string> = {
  XXBT: "BTC",
  XBT: "BTC",
  XETH: "ETH",
  XLTC: "LTC",
  XXRP: "XRP",
  ZUSD: "USD",
  ZEUR: "EUR",
  ZGBP: "GBP",
  ZCAD: "CAD",
};

function normalizeKrakenAsset(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return ASSET_ALIASES[upper] ?? upper;
}

function pick(values: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const found = Object.keys(values).find((k) => k.toLowerCase() === name.toLowerCase());
    if (found !== undefined && values[found] !== undefined) return values[found];
  }
  return "";
}

export const krakenAdapter: ExchangeAdapter = {
  id: "kraken",
  label: "Kraken",
  signatureHeaders: ["txid", "refid", "time", "type", "aclass", "asset", "amount", "fee", "balance"],
  mapRow(values): CanonicalRow[] {
    const rawDate = pick(values, "time");
    const date = normalizeExchangeDate(rawDate.slice(0, 10));
    const rawType = pick(values, "type").toLowerCase().trim();
    const rawAsset = pick(values, "asset");
    const amount = pick(values, "amount");
    const fee = pick(values, "fee");

    if (!rawAsset || !amount) return [];

    const asset = normalizeKrakenAsset(rawAsset);
    // "spend" in Kraken means selling base asset: remap to "sell"
    const effectiveType = rawType === "spend" ? "sell" : rawType;
    const type = mapOperation(effectiveType, TYPE_TABLE);

    const row: CanonicalRow = {
      date,
      type,
      asset,
      amount: absAmount(amount),
      fee: fee ? absAmount(fee) : undefined,
      fee_asset: asset,
    };
    return [row];
  },
};
