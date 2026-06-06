import { describe, expect, it } from "vitest";
import { calculateSourceOfFundsMetrics } from "@/lib/metrics/calculate-source-of-funds-metrics";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("calculateSourceOfFundsMetrics", () => {
  it("derives source-of-funds metrics from existing risk findings", () => {
    expect(calculateSourceOfFundsMetrics(makeAnalyticsSession())).toEqual({
      missingCostBasisCount: 1,
      p2pInflowCount: 1,
      largeFiatWithdrawalCount: 0,
      unmatchedTransferCount: 0,
      unknownSourceWalletCount: 0,
      unknownTransactionTypeCount: 1,
      affectedRowsCount: 3,
    });
  });
});
