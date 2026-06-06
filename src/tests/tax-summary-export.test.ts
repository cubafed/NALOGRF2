import { describe, it, expect } from "vitest";
import {
  buildTaxSummaryExport,
  serializeTaxSummaryCsv,
} from "@/lib/tax/build-tax-summary-export";
import type {
  PreliminaryTaxEstimate,
  PreliminaryTaxEstimateLine,
  PreliminaryTaxEstimateSummary,
} from "@/lib/tax/manual-cost-basis-types";

function line(overrides: Partial<PreliminaryTaxEstimateLine>): PreliminaryTaxEstimateLine {
  return {
    transactionId: "tx-1",
    date: "2024-03-01",
    type: "sell",
    asset: "BTC",
    amount: "1",
    classificationCategory: "taxable_candidate",
    classificationReasonCode: "sell_with_fiat_value",
    status: "included",
    reasonCode: "included_manual_cost_basis",
    explanation: "included",
    requiredData: [],
    fiatCurrency: "USD",
    proceedsFiat: 1000,
    manualCostBasisFiat: 600,
    feeFiat: 10,
    preliminaryTaxableResultFiat: 390,
    // The estimate carries the original transaction + classification, but the
    // export builder only reads the line fields above.
    transaction: { id: "tx-1", type: "sell", asset: "BTC", amount: "1" },
    classification: {
      transactionId: "tx-1",
      category: "taxable_candidate",
      reasonCode: "sell_with_fiat_value",
      explanation: "included",
      requiredData: [],
      includedInFirstEstimate: true,
    },
    ...overrides,
  } as PreliminaryTaxEstimateLine;
}

function estimateOf(lines: PreliminaryTaxEstimateLine[]): PreliminaryTaxEstimate {
  const summary: PreliminaryTaxEstimateSummary = {
    totalOperations: lines.length,
    includedOperations: lines.filter((l) => l.status === "included").length,
    excludedOperations: lines.filter((l) => l.status === "excluded").length,
    needsReviewOperations: lines.filter((l) => l.status === "needs_review").length,
    taxableCandidates: lines.filter((l) => l.classificationCategory === "taxable_candidate").length,
    totalProceedsFiat: 1000,
    totalManualCostBasisFiat: 600,
    totalFeesFiat: 10,
    preliminaryTaxableResultFiat: 390,
    fiatCurrency: "USD",
  };
  return { lines, summary };
}

describe("buildTaxSummaryExport", () => {
  it("includes all required top-level fields", () => {
    const result = buildTaxSummaryExport(estimateOf([line({})]), {
      generatedAt: "2026-06-06T00:00:00.000Z",
    });
    expect(result.generatedAt).toBe("2026-06-06T00:00:00.000Z");
    expect(result.taxYear).toBe(2024);
    expect(result.totals.preliminaryTaxableResultFiat).toBe(390);
    expect(result.disclaimer).toContain("Это не налоговая декларация");
    expect(result.methodologyNote).toContain("Неподдержанные операции");
  });

  it("partitions operations into included / excluded / needs_review", () => {
    const result = buildTaxSummaryExport(
      estimateOf([
        line({ transactionId: "a", status: "included" }),
        line({ transactionId: "b", status: "excluded", reasonCode: "missing_manual_cost_basis" }),
        line({ transactionId: "c", status: "needs_review", reasonCode: "missing_fiat_proceeds" }),
      ]),
      { generatedAt: "2026-06-06T00:00:00.000Z" },
    );
    expect(result.included.map((o) => o.transactionId)).toEqual(["a"]);
    expect(result.excluded.map((o) => o.transactionId)).toEqual(["b"]);
    expect(result.needsReview.map((o) => o.transactionId)).toEqual(["c"]);
  });

  it("counts unsupported operations from classification category", () => {
    const result = buildTaxSummaryExport(
      estimateOf([
        line({ transactionId: "a", status: "included" }),
        line({
          transactionId: "b",
          status: "excluded",
          classificationCategory: "unsupported",
          reasonCode: "unsupported_operation",
        }),
      ]),
      { generatedAt: "2026-06-06T00:00:00.000Z" },
    );
    expect(result.totals.unsupportedOperations).toBe(1);
  });

  it("derives a single tax year only when all dates share a year", () => {
    const single = buildTaxSummaryExport(
      estimateOf([line({ date: "2024-03-01" }), line({ date: "2024-08-01" })]),
      { generatedAt: "x" },
    );
    expect(single.taxYear).toBe(2024);

    const mixed = buildTaxSummaryExport(
      estimateOf([line({ date: "2024-03-01" }), line({ date: "2025-01-01" })]),
      { generatedAt: "x" },
    );
    expect(mixed.taxYear).toBeNull();
  });

  it("honors an explicit taxYear option", () => {
    const result = buildTaxSummaryExport(estimateOf([line({ date: "2024-03-01" })]), {
      generatedAt: "x",
      taxYear: 2023,
    });
    expect(result.taxYear).toBe(2023);
  });
});

describe("serializeTaxSummaryCsv", () => {
  it("produces a header plus one row per operation with a section marker", () => {
    const summary = buildTaxSummaryExport(
      estimateOf([
        line({ transactionId: "a", status: "included" }),
        line({ transactionId: "b", status: "excluded", reasonCode: "missing_manual_cost_basis" }),
      ]),
      { generatedAt: "x" },
    );
    const csv = serializeTaxSummaryCsv(summary);
    const rows = csv.split("\n");
    expect(rows[0]).toContain("section");
    expect(rows[0]).toContain("preliminary_taxable_result_fiat");
    expect(rows).toHaveLength(3); // header + 2 operations
    expect(rows[1].startsWith("included,")).toBe(true);
    expect(rows[2].startsWith("excluded,")).toBe(true);
  });

  it("escapes values containing commas or quotes", () => {
    const summary = buildTaxSummaryExport(
      estimateOf([line({ transactionId: "a", asset: "BTC,X" })]),
      { generatedAt: "x" },
    );
    const csv = serializeTaxSummaryCsv(summary);
    expect(csv).toContain('"BTC,X"');
  });
});
