import type {
  TaxClassificationSummary,
  TaxEventClassification,
  TaxEventReasonCode,
} from "@/lib/tax/tax-event-types";

export function buildTaxClassificationSummary(
  classifications: readonly TaxEventClassification[],
): TaxClassificationSummary {
  if (!Array.isArray(classifications)) {
    throw new TypeError("buildTaxClassificationSummary expects an array of classifications.");
  }

  const reasonCounts: Record<TaxEventReasonCode, number> = {
    sell_with_fiat_value: 0,
    sell_missing_fiat_value: 0,
    p2p_requires_review: 0,
    buy_acquisition_candidate: 0,
    deposit_source_review: 0,
    withdrawal_destination_review: 0,
    transfer_self_transfer_review: 0,
    conversion_unsupported_v0: 0,
    income_requires_review: 0,
    fee_linkage_required: 0,
    unknown_type_excluded: 0,
    missing_required_data: 0,
    unsupported_transaction_type: 0,
  };

  const summary: TaxClassificationSummary = {
    totalTransactions: classifications.length,
    taxableCandidates: 0,
    nonTaxableCandidates: 0,
    needsReview: 0,
    unsupported: 0,
    excludedFromEstimate: 0,
    includedInFirstEstimate: 0,
    excludedFromFirstEstimate: 0,
    reasonCounts,
  };

  for (const classification of classifications) {
    switch (classification.category) {
      case "taxable_candidate":
        summary.taxableCandidates += 1;
        break;
      case "non_taxable_candidate":
        summary.nonTaxableCandidates += 1;
        break;
      case "needs_review":
        summary.needsReview += 1;
        break;
      case "unsupported":
        summary.unsupported += 1;
        break;
      case "excluded_from_estimate":
        summary.excludedFromEstimate += 1;
        break;
    }

    const reasonCode: TaxEventReasonCode = classification.reasonCode;
    summary.reasonCounts[reasonCode] += 1;

    if (classification.includedInFirstEstimate) {
      summary.includedInFirstEstimate += 1;
    } else {
      summary.excludedFromFirstEstimate += 1;
    }
  }

  return summary;
}
