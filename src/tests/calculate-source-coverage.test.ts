import { describe, expect, it } from "vitest";
import { calculateSourceCoverage } from "@/lib/analytics/calculate-source-coverage";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("calculateSourceCoverage", () => {
  it("counts unique sources and transactions by source correctly", () => {
    const coverage = calculateSourceCoverage(makeAnalyticsSession());

    expect(coverage.sourceCount).toBe(2);
    expect(coverage.uniqueSources).toEqual(["Binance", "Kraken"]);
    expect(coverage.transactionsBySource).toEqual([
      { label: "Binance", count: 2 },
      { label: "Kraken", count: 1 },
      { label: "Не указан", count: 1 },
    ]);
  });

  it("derives sources with most findings from existing findings", () => {
    const coverage = calculateSourceCoverage(makeAnalyticsSession());

    expect(coverage.sourcesWithMostFindings).toEqual([
      { label: "Binance", count: 1 },
      { label: "Kraken", count: 1 },
      { label: "Не указан", count: 1 },
    ]);
  });
});
