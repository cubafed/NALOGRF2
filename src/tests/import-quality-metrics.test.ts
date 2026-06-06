import { describe, expect, it } from "vitest";
import { calculateImportQuality } from "@/lib/metrics/calculate-import-quality";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("calculateImportQuality", () => {
  it("calculates import completeness percent correctly", () => {
    const metrics = calculateImportQuality(makeAnalyticsSession());

    expect(metrics.importCompletenessPercent).toBe(80);
    expect(metrics.missingAmountCount).toBe(1);
    expect(metrics.invalidNumericValueCount).toBe(1);
    expect(metrics.unknownTransactionTypeCount).toBe(1);
  });

  it("handles zero rows safely", () => {
    const session = makeAnalyticsSession();
    session.parserSummary.totalRows = 0;
    session.parserSummary.parsedRows = 0;

    expect(calculateImportQuality(session).importCompletenessPercent).toBe(0);
  });
});
