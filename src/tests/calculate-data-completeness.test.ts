import { describe, expect, it } from "vitest";
import { calculateDataCompleteness } from "@/lib/analytics/calculate-data-completeness";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("calculateDataCompleteness", () => {
  it("handles parser errors, warnings, missing fiat, and unknown type", () => {
    const metrics = calculateDataCompleteness(makeAnalyticsSession());

    expect(metrics).toMatchObject({
      totalRows: 5,
      parsedRows: 4,
      warningRows: 1,
      errorRows: 1,
      completeRows: 3,
      incompleteRows: 2,
      importCompletenessPercent: 60,
      missingFiatValueCount: 1,
      unknownTransactionTypeCount: 1,
    });
  });

  it("handles zero rows safely", () => {
    const session = makeAnalyticsSession();
    session.parserSummary.totalRows = 0;
    session.parserSummary.parsedRows = 0;
    session.parserWarnings = [];
    session.parserErrors = [];
    session.transactions = [];

    expect(calculateDataCompleteness(session).importCompletenessPercent).toBe(0);
  });
});
