export interface MonthlyFiatBucket {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface FiatFlowByCurrency {
  currency: string;
  months: MonthlyFiatBucket[];
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
}

export interface FiatFlowResult {
  byCurrency: FiatFlowByCurrency[];
  missingFiatValueCount: number;
  unclassifiedTypeCount: number;
}

export interface DataCompletenessResult {
  totalRows: number;
  completeRows: number;
  warningRows: number;
  errorRows: number;
  missingFiatValueRows: number;
  missingAmountRows: number;
  invalidDateRows: number;
  unknownTypeRows: number;
  completenessPercent: number;
}

export interface SourceCoverageEntry {
  source: string;
  transactionCount: number;
  warningCount: number;
  errorCount: number;
  percent: number;
}

export interface SourceCoverageResult {
  entries: SourceCoverageEntry[];
  unknownSourceCount: number;
}

export interface MonthlyActivityBucket {
  month: string;
  count: number;
  label: string;
}

export interface MonthlyActivityResult {
  buckets: MonthlyActivityBucket[];
  invalidDateCount: number;
}
