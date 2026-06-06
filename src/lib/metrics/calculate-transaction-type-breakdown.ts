import type { TransactionType } from "@/lib/domain/types";
import type { ImportSession } from "@/lib/client/import-session-storage";
import type { TransactionTypeBreakdown } from "@/lib/metrics/analytics-types";

export const dashboardTransactionTypes: TransactionType[] = [
  "buy",
  "sell",
  "deposit",
  "withdrawal",
  "transfer",
  "conversion",
  "income",
  "p2p",
  "fee",
  "unknown",
];

export function calculateTransactionTypeBreakdown(
  session: ImportSession,
): TransactionTypeBreakdown {
  const counts = Object.fromEntries(
    dashboardTransactionTypes.map((type) => [type, 0]),
  ) as TransactionTypeBreakdown;

  session.transactions.forEach((transaction) => {
    counts[transaction.type] += 1;
  });

  return counts;
}
