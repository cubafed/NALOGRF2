import { describe, it, expect } from "vitest";
import { getTaxSummaryContext } from "@/lib/report/tax-summary-context";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";

function entry(id: string): ManualCostBasisByTransactionId {
  return {
    [id]: {
      transactionId: id,
      costBasisFiat: "500",
      fiatCurrency: "USD",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

describe("getTaxSummaryContext", () => {
  it("returns hasCostBasis false and entryCount 0 for empty entries", () => {
    const result = getTaxSummaryContext({});
    expect(result.hasCostBasis).toBe(false);
    expect(result.entryCount).toBe(0);
  });

  it("returns hasCostBasis true for a single entry", () => {
    const result = getTaxSummaryContext(entry("tx-1"));
    expect(result.hasCostBasis).toBe(true);
    expect(result.entryCount).toBe(1);
  });

  it("counts multiple entries correctly", () => {
    const entries: ManualCostBasisByTransactionId = {
      ...entry("tx-1"),
      ...entry("tx-2"),
      ...entry("tx-3"),
    };
    const result = getTaxSummaryContext(entries);
    expect(result.hasCostBasis).toBe(true);
    expect(result.entryCount).toBe(3);
  });

  it("is safe with entries that have no fiatCurrency", () => {
    const entries: ManualCostBasisByTransactionId = {
      "tx-x": {
        transactionId: "tx-x",
        costBasisFiat: "100",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    };
    const result = getTaxSummaryContext(entries);
    expect(result.hasCostBasis).toBe(true);
    expect(result.entryCount).toBe(1);
  });
});
