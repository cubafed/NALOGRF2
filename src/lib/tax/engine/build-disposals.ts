import type { Transaction, TransactionType } from "@/lib/domain/types";
import { convertToReport } from "@/lib/tax/rates/convert";
import type { RateLookup } from "@/lib/tax/engine/engine-types";

/** Operation types treated as disposals (asset leaving the holder for proceeds). */
export const DISPOSAL_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>([
  "sell",
  "p2p",
]);

/** One disposal ready for cost-basis matching (quantity + report-currency proceeds/fee). */
export interface DisposalInput {
  transaction: Transaction;
  asset: string;
  date?: string;
  quantity: number;
  proceedsReport: number | null;
  feeReport: number;
}

function parsePositive(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function transactionDate(transaction: Transaction): string | undefined {
  return transaction.date ?? transaction.timestamp;
}

export function isDisposal(transaction: Transaction): boolean {
  return DISPOSAL_TYPES.has(transaction.type);
}

/**
 * Build disposal inputs from the transaction list, converting proceeds and fees into the
 * report currency on the transaction date. A crypto-denominated fee needs a price
 * (Phase 2) and is treated as 0 here. Shared by the tax engine and portfolio so the same
 * disposal extraction is applied everywhere (no duplicated logic).
 */
export function buildDisposalInputs(
  transactions: readonly Transaction[],
  rates: RateLookup,
): DisposalInput[] {
  return transactions.filter(isDisposal).map((transaction) => {
    const date = transactionDate(transaction);
    const quantity = parsePositive(transaction.amount) ?? 0;
    const proceedsReport = convertToReport(
      parsePositive(transaction.fiatValue),
      transaction.fiatCurrency,
      date,
      rates,
    );
    const feeReport =
      convertToReport(parsePositive(transaction.feeAmount), transaction.feeAsset, date, rates) ?? 0;

    return {
      transaction,
      asset: (transaction.asset ?? "").trim().toUpperCase(),
      date,
      quantity,
      proceedsReport,
      feeReport,
    };
  });
}
