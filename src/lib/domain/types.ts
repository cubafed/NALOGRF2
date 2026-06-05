export type TransactionType =
  | "buy"
  | "sell"
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "fee"
  | "p2p"
  | "conversion"
  | "income"
  | "unknown";

export type FindingSeverity = "critical" | "medium" | "low";

export interface ReportPeriod {
  startYear: number;
  endYear: number;
  label: string;
}

export interface Transaction {
  id: string;
  date: string;
  source: string;
  type: TransactionType;
  asset: string;
  amount: string;
  fiatValue: string | null;
  counterparty: string | null;
  status: "ok" | "needs_review" | "missing_data";
  findingRuleIds: string[];
}

export interface Finding {
  id: string;
  ruleId: string;
  severity: FindingSeverity;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  documentsNeeded: string[];
  affectedTransactionIds: string[];
  count: number;
}

export interface Report {
  id: string;
  title: string;
  status: "demo" | "draft" | "ready";
  period: ReportPeriod;
  operationsCount: number;
  readinessScore: number;
  riskScore: number;
  findings: Finding[];
  generatedAt: string;
}

export interface DemoReport extends Report {
  status: "demo";
  metrics: {
    missingCostBasis: number;
    p2pInflows: number;
    largeFiatWithdrawals: number;
    unmatchedTransfers: number;
    unknownSourceWallets: number;
  };
  sampleTransactions: Transaction[];
}
