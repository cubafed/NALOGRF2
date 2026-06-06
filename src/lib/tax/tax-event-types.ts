import type { Transaction } from "@/lib/domain/types";

export type TaxEventClassificationCategory =
  | "taxable_candidate"
  | "non_taxable_candidate"
  | "needs_review"
  | "unsupported"
  | "excluded_from_estimate";

export type TaxEventReasonCode =
  | "sell_with_fiat_value"
  | "sell_missing_fiat_value"
  | "p2p_requires_review"
  | "buy_acquisition_candidate"
  | "deposit_source_review"
  | "withdrawal_destination_review"
  | "transfer_self_transfer_review"
  | "conversion_unsupported_v0"
  | "income_requires_review"
  | "fee_linkage_required"
  | "unknown_type_excluded"
  | "missing_required_data"
  | "unsupported_transaction_type";

export interface TaxEventClassification {
  transactionId: string;
  rawRowId?: string;
  category: TaxEventClassificationCategory;
  reasonCode: TaxEventReasonCode;
  explanation: string;
  requiredData: string[];
  includedInFirstEstimate: boolean;
}

export interface TaxClassificationSummary {
  totalTransactions: number;
  taxableCandidates: number;
  nonTaxableCandidates: number;
  needsReview: number;
  unsupported: number;
  excludedFromEstimate: number;
  includedInFirstEstimate: number;
  excludedFromFirstEstimate: number;
  reasonCounts: Record<TaxEventReasonCode, number>;
}

export type TaxClassifiableTransaction = Transaction;
