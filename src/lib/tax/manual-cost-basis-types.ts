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

/**
 * Per-currency totals for included operations. Monetary values are never summed
 * across currencies — each currency is reported separately.
 */
export interface PreliminaryTaxEstimateCurrencyTotals {
  fiatCurrency: string;
  includedOperations: number;
  totalProceedsFiat: number;
  totalManualCostBasisFiat: number;
  totalFeesFiat: number;
  preliminaryTaxableResultFiat: number;
}

export interface PreliminaryTaxEstimateSummary {
  totalOperations: number;
  includedOperations: number;
  excludedOperations: number;
  needsReviewOperations: number;
  taxableCandidates: number;
  /**
   * Flat totals. Only meaningful when all included operations share one
   * currency; for mixed currencies use `byCurrency`. `fiatCurrency` reflects
   * the dominant currency (most included operations).
   */
  totalProceedsFiat: number;
  totalManualCostBasisFiat: number;
  totalFeesFiat: number;
  preliminaryTaxableResultFiat: number;
  fiatCurrency: string;
  /** Per-currency totals; never mixes currencies. */
  byCurrency: PreliminaryTaxEstimateCurrencyTotals[];
}

export interface PreliminaryTaxEstimate {
  lines: PreliminaryTaxEstimateLine[];
  summary: PreliminaryTaxEstimateSummary;
}
