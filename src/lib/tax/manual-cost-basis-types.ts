import type { Transaction, TransactionType } from "@/lib/domain/types";
import type {
  TaxEventClassification,
  TaxEventClassificationCategory,
  TaxEventReasonCode,
} from "@/lib/tax/tax-event-types";

export interface ManualCostBasisEntry {
  transactionId: string;
  costBasisFiat: string;
  fiatCurrency?: string;
  updatedAt: string;
}

export type ManualCostBasisByTransactionId = Record<string, ManualCostBasisEntry>;

export type TaxEstimateOperationStatus = "included" | "excluded" | "needs_review";

export type TaxEstimateOperationReasonCode =
  | "included_manual_cost_basis"
  | "missing_manual_cost_basis"
  | "missing_fiat_proceeds"
  | "unsupported_operation"
  | "classification_needs_review"
  | "classification_excluded"
  | "non_taxable_operation";

export interface PreliminaryTaxEstimateLine {
  transactionId: string;
  rawRowId?: string;
  date?: string;
  type: TransactionType;
  asset: string;
  amount: string;
  source?: string;
  classificationCategory: TaxEventClassificationCategory;
  classificationReasonCode: TaxEventReasonCode;
  status: TaxEstimateOperationStatus;
  reasonCode: TaxEstimateOperationReasonCode;
  explanation: string;
  requiredData: string[];
  fiatCurrency: string;
  proceedsFiat: number | null;
  manualCostBasisFiat: number | null;
  feeFiat: number;
  preliminaryTaxableResultFiat: number | null;
  transaction: Transaction;
  classification: TaxEventClassification;
}

export interface PreliminaryTaxEstimateSummary {
  totalOperations: number;
  includedOperations: number;
  excludedOperations: number;
  needsReviewOperations: number;
  taxableCandidates: number;
  totalProceedsFiat: number;
  totalManualCostBasisFiat: number;
  totalFeesFiat: number;
  preliminaryTaxableResultFiat: number;
  fiatCurrency: string;
}

export interface PreliminaryTaxEstimate {
  lines: PreliminaryTaxEstimateLine[];
  summary: PreliminaryTaxEstimateSummary;
}
