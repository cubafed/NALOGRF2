import type { FindingSeverity, TransactionType } from "@/lib/domain/types";
import type { ReadinessLabel, RiskSummary } from "@/lib/risk/risk-types";

export interface AnalyticsCount {
  label: string;
  count: number;
}

export interface MonthlyTransactionCount {
  month: string;
  count: number;
}

export interface DataCompletenessMetrics {
  totalRows: number;
  parsedRows: number;
  warningRows: number;
  errorRows: number;
  completeRows: number;
  incompleteRows: number;
  importCompletenessPercent: number;
  missingFiatValueCount: number;
  unknownTransactionTypeCount: number;
}

export type TransactionTypeCounts = Record<TransactionType, number>;

export interface SourceCoverageMetrics {
  sourceCount: number;
  uniqueSources: string[];
  transactionsBySource: AnalyticsCount[];
  sourcesWithMostFindings: AnalyticsCount[];
  note: string;
}

export type FindingsBySeverity = Record<FindingSeverity, number>;

export interface AnalyticsDashboardModel {
  fileName: string | null;
  savedAt: string;
  period: string;
  transactionCount: number;
  sourceCount: number;
  uniqueSources: string[];
  transactionsBySource: AnalyticsCount[];
  transactionsByType: TransactionTypeCounts;
  monthlyTransactions: MonthlyTransactionCount[];
  parserErrorCount: number;
  parserWarningCount: number;
  riskSummary: RiskSummary;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  findingsBySeverity: FindingsBySeverity;
  findingsByRuleId: AnalyticsCount[];
  affectedTransactionCount: number;
  importCompletenessPercent: number;
  missingFiatValueCount: number;
  unknownTransactionTypeCount: number;
  sourceOfFundsGapCount: number;
  dataCompleteness: DataCompletenessMetrics;
  sourceCoverage: SourceCoverageMetrics;
}
