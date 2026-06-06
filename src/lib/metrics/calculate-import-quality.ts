import type { ImportSession } from "@/lib/client/import-session-storage";
import type { ImportQualityMetrics } from "@/lib/metrics/analytics-types";

export function calculateImportQuality(session: ImportSession): ImportQualityMetrics {
  const { parserSummary, parserErrors, parserWarnings, transactions } = session;
  const importCompletenessPercent =
    parserSummary.totalRows > 0
      ? Math.round((parserSummary.parsedRows / parserSummary.totalRows) * 100)
      : 0;

  return {
    totalRows: parserSummary.totalRows,
    parsedRows: parserSummary.parsedRows,
    warningRows: parserSummary.warningRows,
    errorRows: parserSummary.errorRows,
    warningCount: parserSummary.warningCount,
    errorCount: parserSummary.errorCount,
    importCompletenessPercent,
    missingAmountCount: parserErrors.filter(
      (error) => error.code === "MISSING_REQUIRED_FIELD" && error.field === "amount",
    ).length,
    invalidNumericValueCount: [
      ...parserErrors.filter((error) => error.code === "INVALID_NUMBER"),
      ...parserWarnings.filter((warning) => warning.code === "INVALID_OPTIONAL_NUMBER"),
    ].length,
    unknownTransactionTypeCount: transactions.filter(
      (transaction) => transaction.type === "unknown",
    ).length,
  };
}
