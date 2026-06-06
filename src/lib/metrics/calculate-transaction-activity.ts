import type { ImportSession } from "@/lib/client/import-session-storage";
import type { TransactionActivityPoint } from "@/lib/metrics/analytics-types";

function monthKey(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 7);
}

export function calculateTransactionActivity(
  session: ImportSession,
): TransactionActivityPoint[] {
  const monthlyCounts = new Map<string, number>();

  session.transactions.forEach((transaction) => {
    const key = monthKey(transaction.timestamp ?? transaction.date);

    if (!key) {
      return;
    }

    monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1);
  });

  return [...monthlyCounts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => ({ month, count }));
}
