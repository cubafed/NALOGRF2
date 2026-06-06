import type { FindingSeverity, Transaction, TransactionType } from "@/lib/domain/types";
import type { ImportSession } from "@/lib/client/import-session-storage";
import type {
  AnalyticsCount,
  AnalyticsDashboardModel,
  FindingsBySeverity,
  TransactionTypeCounts,
} from "@/lib/analytics/analytics-types";
import { calculateDataCompleteness } from "@/lib/analytics/calculate-data-completeness";
import { calculateSourceCoverage } from "@/lib/analytics/calculate-source-coverage";
import { groupTransactionsByMonth } from "@/lib/analytics/group-transactions-by-month";

export const analyticsTransactionTypes: TransactionType[] = [
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

const sourceOfFundsRuleIds = new Set([
  "missing_cost_basis_basic",
  "large_p2p_inflow",
  "large_fiat_withdrawal",
  "unknown_source_wallet",
  "unmatched_transfer",
  "unknown_transaction_type",
]);

function transactionDate(transaction: Transaction): Date | null {
  const value = transaction.timestamp ?? transaction.date;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function periodLabel(transactions: readonly Transaction[]): string {
  const dates = transactions
    .map(transactionDate)
    .filter((date): date is Date => date !== null)
    .sort((left, right) => left.getTime() - right.getTime());

  if (dates.length === 0) return "Нет данных";

  const first = dates[0].toISOString().slice(0, 7);
  const last = dates[dates.length - 1].toISOString().slice(0, 7);
  return first === last ? first : `${first} — ${last}`;
}

function countTransactionsByType(transactions: readonly Transaction[]): TransactionTypeCounts {
  const counts = Object.fromEntries(
    analyticsTransactionTypes.map((type) => [type, 0]),
  ) as TransactionTypeCounts;

  transactions.forEach((transaction) => {
    counts[transaction.type] += 1;
  });

  return counts;
}

function findingsBySeverity(session: ImportSession): FindingsBySeverity {
  const counts: FindingsBySeverity = {
    critical: 0,
    medium: 0,
    low: 0,
  };

  session.riskResult.findings.forEach((finding) => {
    counts[finding.severity as FindingSeverity] += 1;
  });

  return counts;
}

function findingsByRuleId(session: ImportSession): AnalyticsCount[] {
  const counts = new Map<string, number>();

  session.riskResult.findings.forEach((finding) => {
    counts.set(finding.ruleId, (counts.get(finding.ruleId) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function sourceOfFundsGapCount(session: ImportSession): number {
  return session.riskResult.findings.filter((finding) =>
    sourceOfFundsRuleIds.has(finding.ruleId),
  ).length;
}

export function buildAnalyticsDashboard(session: ImportSession): AnalyticsDashboardModel {
  const dataCompleteness = calculateDataCompleteness(session);
  const sourceCoverage = calculateSourceCoverage(session);

  return {
    fileName: session.fileName,
    savedAt: session.savedAt,
    period: periodLabel(session.transactions),
    transactionCount: session.transactions.length,
    sourceCount: sourceCoverage.sourceCount,
    uniqueSources: sourceCoverage.uniqueSources,
    transactionsBySource: sourceCoverage.transactionsBySource,
    transactionsByType: countTransactionsByType(session.transactions),
    monthlyTransactions: groupTransactionsByMonth(session.transactions),
    parserErrorCount: session.parserSummary.errorCount,
    parserWarningCount: session.parserSummary.warningCount,
    riskSummary: session.riskResult.summary,
    readinessScore: session.riskResult.readinessScore,
    readinessLabel: session.riskResult.readinessLabel,
    findingsBySeverity: findingsBySeverity(session),
    findingsByRuleId: findingsByRuleId(session),
    affectedTransactionCount: session.riskResult.summary.affectedTransactionCount,
    importCompletenessPercent: dataCompleteness.importCompletenessPercent,
    missingFiatValueCount: dataCompleteness.missingFiatValueCount,
    unknownTransactionTypeCount: dataCompleteness.unknownTransactionTypeCount,
    sourceOfFundsGapCount: sourceOfFundsGapCount(session),
    dataCompleteness,
    sourceCoverage,
  };
}
