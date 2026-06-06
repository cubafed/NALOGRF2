import type { TransactionType } from "@/lib/domain/types";
import type { TaxEventClassificationCategory } from "@/lib/tax/tax-event-types";
import type {
  TaxEstimateOperationReasonCode,
  TaxEstimateOperationStatus,
} from "@/lib/tax/manual-cost-basis-types";

/**
 * One operation row inside the local tax summary export. Mirrors the fields
 * that an accountant / tax consultant would need to review a preliminary
 * estimate. No official tax due, no tax advice.
 */
export interface TaxSummaryExportOperation {
  transactionId: string;
  rawRowId?: string;
  date?: string;
  type: TransactionType;
  asset: string;
  amount: string;
  fiatCurrency: string;
  classificationCategory: TaxEventClassificationCategory;
  status: TaxEstimateOperationStatus;
  reasonCode: TaxEstimateOperationReasonCode;
  proceedsFiat: number | null;
  manualCostBasisFiat: number | null;
  feeFiat: number;
  preliminaryTaxableResultFiat: number | null;
}

export interface TaxSummaryExportTotals {
  totalOperations: number;
  includedOperations: number;
  excludedOperations: number;
  needsReviewOperations: number;
  unsupportedOperations: number;
  totalProceedsFiat: number;
  totalManualCostBasisFiat: number;
  totalFeesFiat: number;
  preliminaryTaxableResultFiat: number;
}

/**
 * The full local tax summary export payload. Built deterministically from a
 * preliminary estimate. Intended to be saved locally and handed to an
 * accountant / tax consultant — it is NOT a tax return and NOT tax advice.
 */
export interface TaxSummaryExport {
  generatedAt: string;
  taxYear: number | null;
  fiatCurrency: string;
  totals: TaxSummaryExportTotals;
  included: TaxSummaryExportOperation[];
  excluded: TaxSummaryExportOperation[];
  needsReview: TaxSummaryExportOperation[];
  disclaimer: string;
  methodologyNote: string;
}

export interface BuildTaxSummaryExportOptions {
  /** Injectable timestamp for deterministic output (tests). */
  generatedAt?: string;
  /** Explicit tax year; when omitted it is derived from operation dates. */
  taxYear?: number | null;
}

export const TAX_SUMMARY_DISCLAIMER =
  "Это не налоговая декларация и не налоговая консультация. " +
  "Используйте предварительную оценку для проверки с бухгалтером или налоговым консультантом.";

export const TAX_SUMMARY_METHODOLOGY_NOTE =
  "Расчет основан только на загруженных данных и ручной себестоимости. " +
  "Неподдержанные операции исключены из оценки.";
