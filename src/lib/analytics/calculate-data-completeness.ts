import type { ImportSession } from "@/lib/client/import-session-storage";
import type { DataCompletenessMetrics } from "@/lib/analytics/analytics-types";

function hasMissingFiatValue(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}

export function calculateDataCompleteness(session: ImportSession): DataCompletenessMetrics {
  const incompleteRows = new Set<number>();

  session.parserErrors.forEach((error) => {
    if (typeof error.rowNumber === "number") incompleteRows.add(error.rowNumber);
  });

  session.parserWarnings.forEach((warning) => {
    if (typeof warning.rowNumber === "number") incompleteRows.add(warning.rowNumber);
  });

  const missingFiatValueCount = session.transactions.filter((transaction) =>
    hasMissingFiatValue(transaction.fiatValue),
  ).length;

  const unknownTransactionTypeCount = session.transactions.filter(
    (transaction) => transaction.type === "unknown",
  ).length;

  session.transactions.forEach((transaction) => {
    if (
      typeof transaction.rawRowNumber === "number" &&
      (hasMissingFiatValue(transaction.fiatValue) || transaction.type === "unknown")
    ) {
      incompleteRows.add(transaction.rawRowNumber);
    }
  });

  const totalRows = session.parserSummary.totalRows;
  const incompleteRowCount = Math.min(incompleteRows.size, totalRows);
  const completeRows = Math.max(totalRows - incompleteRowCount, 0);

  // MVP formula: rows are incomplete when they have parser errors, parser warnings,
  // missing fiat value, or unknown transaction type. This is not tax logic.
  const importCompletenessPercent =
    totalRows > 0 ? Math.round((completeRows / totalRows) * 100) : 0;

  return {
    totalRows,
    parsedRows: session.parserSummary.parsedRows,
    warningRows: session.parserSummary.warningRows,
    errorRows: session.parserSummary.errorRows,
    completeRows,
    incompleteRows: incompleteRowCount,
    importCompletenessPercent,
    missingFiatValueCount,
    unknownTransactionTypeCount,
  };
}
