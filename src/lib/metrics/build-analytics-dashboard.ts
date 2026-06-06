import type { ImportSession } from "@/lib/client/import-session-storage";
import type { AnalyticsDashboardModel } from "@/lib/metrics/analytics-types";
import { calculateImportQuality } from "@/lib/metrics/calculate-import-quality";
import { calculateSourceCoverage } from "@/lib/metrics/calculate-source-coverage";
import { calculateSourceOfFundsMetrics } from "@/lib/metrics/calculate-source-of-funds-metrics";
import { calculateTransactionActivity } from "@/lib/metrics/calculate-transaction-activity";
import { calculateTransactionTypeBreakdown } from "@/lib/metrics/calculate-transaction-type-breakdown";

function uniqueCount(values: Array<string | null | undefined>): number {
  return new Set(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value && value.length > 0)),
  ).size;
}

function uniqueDocumentsNeeded(session: ImportSession): number {
  return new Set(
    session.riskResult.findings.flatMap((finding) => finding.documentsNeeded),
  ).size;
}

function recommendedNextAction(session: ImportSession): string {
  if (session.riskResult.summary.criticalCount > 0) {
    return "Сначала разберите критичные проблемы";
  }

  if (session.riskResult.summary.mediumCount > 0) {
    return "Проверьте средние проблемы";
  }

  return "Отчет выглядит готовым для первичной проверки";
}

export function buildAnalyticsDashboard(session: ImportSession): AnalyticsDashboardModel {
  const importQuality = calculateImportQuality(session);
  const sourceCoverage = calculateSourceCoverage(session);
  const sourceOfFunds = calculateSourceOfFundsMetrics(session);
  const transactionActivity = calculateTransactionActivity(session);
  const transactionTypeBreakdown = calculateTransactionTypeBreakdown(session);
  const { riskResult } = session;

  return {
    fileName: session.fileName,
    savedAt: session.savedAt,
    summary: {
      totalOperations: session.parserSummary.totalRows,
      parsedTransactions: session.parserSummary.transactionCount,
      parserErrors: session.parserSummary.errorCount,
      parserWarnings: session.parserSummary.warningCount,
      readinessScore: riskResult.readinessScore,
      totalFindings: riskResult.summary.totalFindings,
      criticalFindings: riskResult.summary.criticalCount,
      mediumFindings: riskResult.summary.mediumCount,
      lowFindings: riskResult.summary.lowCount,
      uniqueAssets: uniqueCount(session.transactions.map((transaction) => transaction.asset)),
      uniqueSources: sourceCoverage.uniqueSources,
    },
    importQuality,
    sourceCoverage,
    sourceOfFunds,
    reportReadiness: {
      readinessScore: riskResult.readinessScore,
      readinessLabel: riskResult.readinessLabel,
      criticalFindings: riskResult.summary.criticalCount,
      mediumFindings: riskResult.summary.mediumCount,
      lowFindings: riskResult.summary.lowCount,
      parserIssueCount: session.parserSummary.errorCount + session.parserSummary.warningCount,
      uniqueDocumentsNeeded: uniqueDocumentsNeeded(session),
      recommendedNextAction: recommendedNextAction(session),
    },
    transactionActivity,
    transactionTypeBreakdown,
  };
}
