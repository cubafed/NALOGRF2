import type { Transaction } from "@/lib/domain/types";
import type { MonthlyTransactionCount } from "@/lib/analytics/analytics-types";

function monthKey(value: string | undefined): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 7);
}

export function groupTransactionsByMonth(
  transactions: readonly Transaction[],
): MonthlyTransactionCount[] {
  const counts = new Map<string, number>();

  transactions.forEach((transaction) => {
    const key = monthKey(transaction.timestamp ?? transaction.date);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => ({ month, count }));
}
