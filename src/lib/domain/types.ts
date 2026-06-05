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
  date?: string;
  timestamp?: string;
  source?: string;
  type: TransactionType;
  asset: string;
  amount: string;
  price?: string;
  fiatValue?: string | null;
  fiatCurrency?: string;
  feeAmount?: string;
  feeAsset?: string;
  txHash?: string;
  orderId?: string;
  counterparty?: string | null;
  notes?: string;
  status?: "ok" | "needs_review" | "missing_data";
  findingRuleIds?: string[];
  rawRowNumber?: number;
  originalType?: string;
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
