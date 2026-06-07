import type { TransactionType } from "@/lib/domain/types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { absAmount, mapOperation, normalizeExchangeDate } from "@/lib/integrations/adapter-helpers";

/**
 * Bybit asset-movement export adapter.
 *
 * Expected columns (case-insensitive): Time, Currency, Type, Quantity.
 * Optional: Fee, Fee Currency, Description. Each line is one coin movement and maps
 * to a single canonical row. Unrecognized Type labels become "unknown" so they are
 * surfaced for review rather than dropped.
 */
const TYPE_TABLE: ReadonlyArray<[string, TransactionType]> = [
  ["deposit", "deposit"],
  ["withdraw", "withdrawal"],
  ["p2p", "p2p"],
  ["buy", "buy"],
  ["sell", "sell"],
  ["trade", "conversion"],
  ["convert", "conversion"],
  ["fee", "fee"],
  ["interest", "income"],
  ["earn", "income"],
  ["staking", "income"],
  ["reward", "income"],
  ["airdrop", "income"],
  ["bonus", "income"],
  ["transfer", "transfer"],
];

function pick(values: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const found = Object.keys(values).find((key) => key.toLowerCase() === name.toLowerCase());
    if (found && values[found] !== undefined) return values[found];
  }
  return "";
}

export const bybitAdapter: ExchangeAdapter = {
  id: "bybit",
  label: "Bybit",
  signatureHeaders: ["Time", "Currency", "Type", "Quantity"],
  mapRow(values): CanonicalRow[] {
    const date = normalizeExchangeDate(pick(values, "Time"));
    const typeLabel = pick(values, "Type");
    const asset = pick(values, "Currency", "Coin").trim().toUpperCase();
    const quantity = pick(values, "Quantity", "Amount");
    if (asset === "" && quantity === "") return [];

    const row: CanonicalRow = {
      date,
      type: mapOperation(typeLabel, TYPE_TABLE),
      asset,
      amount: absAmount(quantity),
      source: "Bybit",
    };

    const fee = pick(values, "Fee");
    if (fee.trim() !== "" && absAmount(fee) !== "0") {
      row.fee = absAmount(fee);
      const feeAsset = pick(values, "Fee Currency", "Fee Coin").trim().toUpperCase();
      if (feeAsset) row.fee_asset = feeAsset;
    }

    const description = pick(values, "Description").trim();
    const notes = [typeLabel.trim(), description].filter(Boolean).join(" — ");
    if (notes) row.notes = notes;
    return [row];
  },
};
