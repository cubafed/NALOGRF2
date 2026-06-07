import { describe, expect, it } from "vitest";
import { buildTaxClassificationSummary } from "@/lib/tax/tax-classification-summary";
import type { TaxEventClassification } from "@/lib/tax/tax-event-types";

const classifications: TaxEventClassification[] = [
  {
    transactionId: "sell-1",
    category: "taxable_candidate",
    reasonCode: "sell_with_fiat_value",
    explanation: "Taxable candidate for preliminary estimate.",
    requiredData: ["acquisition cost / cost basis"],
    includedInFirstEstimate: true,
  },
  {
    transactionId: "buy-1",
    category: "non_taxable_candidate",
    reasonCode: "buy_acquisition_candidate",
    explanation: "Acquisition history candidate.",
    requiredData: [],
    includedInFirstEstimate: false,
  },
  {
    transactionId: "deposit-1",
    category: "needs_review",
    reasonCode: "deposit_source_review",
    explanation: "Needs review.",
    requiredData: ["source explanation"],
    includedInFirstEstimate: false,
  },
  {
    transactionId: "conversion-1",
    category: "unsupported",
    reasonCode: "conversion_unsupported_v0",
    explanation: "Unsupported in this version.",
    requiredData: ["approved conversion methodology"],
    includedInFirstEstimate: false,
  },
  {
    transactionId: "unknown-1",
    category: "excluded_from_estimate",
    reasonCode: "unknown_type_excluded",
    explanation: "Excluded from estimate.",
    requiredData: ["supported operation type"],
    includedInFirstEstimate: false,
  },
  {
    transactionId: "deposit-2",
    category: "needs_review",
    reasonCode: "deposit_source_review",
    explanation: "Needs review.",
    requiredData: ["source explanation"],
    includedInFirstEstimate: false,
  },
];

describe("buildTaxClassificationSummary", () => {
  it("counts categories correctly", () => {
    const summary = buildTaxClassificationSummary(classifications);

    expect(summary).toMatchObject({
      totalTransactions: 6,
      taxableCandidates: 1,
      nonTaxableCandidates: 1,
      needsReview: 2,
      unsupported: 1,
      excludedFromEstimate: 1,
    });
  });

  it("counts included and excluded from first estimate", () => {
    const summary = buildTaxClassificationSummary(classifications);

    expect(summary.includedInFirstEstimate).toBe(1);
    expect(summary.excludedFromFirstEstimate).toBe(5);
  });

  it("builds deterministic reasonCounts", () => {
    const summary = buildTaxClassificationSummary(classifications);

    expect(Object.keys(summary.reasonCounts)).toEqual([
      "sell_with_fiat_value",
      "sell_missing_fiat_value",
      "p2p_requires_review",
      "buy_acquisition_candidate",
      "deposit_source_review",
      "withdrawal_destination_review",
      "transfer_self_transfer_review",
      "conversion_unsupported_v0",
      "income_requires_review",
      "fee_linkage_required",
      "unknown_type_excluded",
      "missing_required_data",
      "unsupported_transaction_type",
    ]);
    expect(summary.reasonCounts.sell_with_fiat_value).toBe(1);
    expect(summary.reasonCounts.deposit_source_review).toBe(2);
    expect(summary.reasonCounts.sell_missing_fiat_value).toBe(0);
  });

  it("throws when input is not an array", () => {
    expect(() =>
      buildTaxClassificationSummary({} as unknown as TaxEventClassification[]),
    ).toThrow(TypeError);
  });
});
