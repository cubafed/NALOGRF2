import type { TransactionType } from "@/lib/domain/types";
import type { ImportSession } from "@/lib/client/import-session-storage";
import type { ReadinessLabel } from "@/lib/risk/risk-types";

export interface MetricCount {
  label: string;
  count: number;
}

export interface ImportQualityMetrics {
  totalRows: number;
  parsedRows: number;
  warningRows: number;
  errorRows: number;
  warningCount: number;
  errorCount: number;
  importCompletenessPercent: number;
  missingAmountCount: number;
  invalidNumericValueCount: number;
  unknownTransactionTypeCount: number;
}

export type SourceCoverageStatus = "Есть данные" | "Требует проверки" | "Нет данных";

export interface SourceCoverageMetrics {
  uniqueSources: number;
  transactionsPerSource: MetricCount[];
  topSources: MetricCount[];
  sourcesWithIssues: string[];
  status: SourceCoverageStatus;
}

export interface TransactionActivityPoint {
  month: string;
  count: number;
}

export type TransactionTypeBreakdown = Record<TransactionType, number>;

export interface SourceOfFundsMetrics {
  missingCostBasisCount: number;
  p2pInflowCount: number;
  largeFiatWithdrawalCount: number;
  unmatchedTransferCount: number;
  unknownSourceWalletCount: number;
  unknownTransactionTypeCount: number;
  affectedRowsCount: number;
}

export interface ReportReadinessMetrics {
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  criticalFindings: number;
  mediumFindings: number;
  lowFindings: number;
  parserIssueCount: number;
  uniqueDocumentsNeeded: number;
  recommendedNextAction: string;
}

export interface AnalyticsSummaryMetrics {
  totalOperations: number;
  parsedTransactions: number;
  parserErrors: number;
  parserWarnings: number;
  readinessScore: number;
  totalFindings: number;
  criticalFindings: number;
  mediumFindings: number;
  lowFindings: number;
  uniqueAssets: number;
  uniqueSources: number;
}

export interface AnalyticsDashboardModel {
  fileName: string | null;
  savedAt: string;
  summary: AnalyticsSummaryMetrics;
  importQuality: ImportQualityMetrics;
  sourceCoverage: SourceCoverageMetrics;
  sourceOfFunds: SourceOfFundsMetrics;
  reportReadiness: ReportReadinessMetrics;
  transactionActivity: TransactionActivityPoint[];
  transactionTypeBreakdown: TransactionTypeBreakdown;
}

export interface BuildAnalyticsDashboardInput {
  session: ImportSession;
}
