import { describe, expect, it } from "vitest";
import { calculateSourceCoverage } from "@/lib/metrics/calculate-source-coverage";
import { calculateTransactionActivity } from "@/lib/metrics/calculate-transaction-activity";
import { calculateTransactionTypeBreakdown } from "@/lib/metrics/calculate-transaction-type-breakdown";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("transaction and source metrics", () => {
  it("groups transactions by month and ignores invalid/missing dates safely", () => {
    expect(calculateTransactionActivity(makeAnalyticsSession())).toEqual([
      { month: "2024-01", count: 2 },
      { month: "2024-02", count: 1 },
    ]);
  });

  it("counts known transaction types", () => {
    const breakdown = calculateTransactionTypeBreakdown(makeAnalyticsSession());

    expect(breakdown.buy).toBe(1);
    expect(breakdown.sell).toBe(1);
    expect(breakdown.p2p).toBe(1);
    expect(breakdown.unknown).toBe(1);
  });

  it("groups transactions by source and handles missing source safely", () => {
    const coverage = calculateSourceCoverage(makeAnalyticsSession());

    expect(coverage.transactionsPerSource).toEqual([
      { label: "Binance", count: 2 },
      { label: "Kraken", count: 1 },
      { label: "Не указан", count: 1 },
    ]);
    expect(coverage.uniqueSources).toBe(2);
    expect(coverage.status).toBe("Требует проверки");
  });
});
