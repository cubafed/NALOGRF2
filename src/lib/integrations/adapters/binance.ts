import type { TransactionType } from "@/lib/domain/types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { absAmount, mapOperation, normalizeExchangeDate } from "@/lib/integrations/adapter-helpers";

/**
 * Binance "Transaction History" generic export adapter.
 *
 * Expected columns (case-insensitive): UTC_Time, Operation, Coin, Change.
 * Optional: Account, Remark. Each export line is one ledger movement of a single coin,
 * so it maps to exactly one canonical row. The Change column carries the sign; the
 * canonical amount keeps the magnitude and the type encodes direction.
 *
 * Supported / unsupported operations: known Binance operation labels are mapped to
 * canonical types via the table below; anything unrecognized becomes "unknown" so the
 * downstream risk engine flags it for review instead of dropping the row.
 */
const OPERATION_TABLE: ReadonlyArray<[string, TransactionType]> = [
  ["deposit", "deposit"],
  ["withdraw", "withdrawal"],
  ["p2p", "p2p"],
  ["buy", "buy"],
  ["sell", "sell"],
  ["fee", "fee"],
  ["commission", "fee"],
  ["distribution", "income"],
  ["interest", "income"],
  ["earn", "income"],
  ["staking", "income"],
  ["reward", "income"],
  ["airdrop", "income"],
  ["convert", "conversion"],
  ["transfer", "transfer"],
];

function pick(values: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const found = Object.keys(values).find((key) => key.toLowerCase() === name.toLowerCase());
    if (found && values[found] !== undefined) return values[found];
  }
  return "";
}

export const binanceAdapter: ExchangeAdapter = {
  id: "binance",
  label: "Binance",
  signatureHeaders: ["UTC_Time", "Operation", "Coin", "Change"],
  mapRow(values): CanonicalRow[] {
    const date = normalizeExchangeDate(pick(values, "UTC_Time"));
    const operation = pick(values, "Operation");
    const asset = pick(values, "Coin").trim().toUpperCase();
    const change = pick(values, "Change");
    if (asset === "" && change === "") return [];

    const type = mapOperation(operation, OPERATION_TABLE);
    const remark = pick(values, "Remark");

    const row: CanonicalRow = {
      date,
      type,
      asset,
      amount: absAmount(change),
      source: "Binance",
    };
    const notes = [operation, remark].map((s) => s.trim()).filter(Boolean).join(" — ");
    if (notes) row.notes = notes;
    return [row];
  },
};
