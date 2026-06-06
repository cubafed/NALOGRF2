import { describe, expect, it } from "vitest";
import { groupTransactionsByMonth } from "@/lib/analytics/group-transactions-by-month";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("groupTransactionsByMonth", () => {
  it("groups transactions by month deterministically", () => {
    expect(groupTransactionsByMonth(makeAnalyticsSession().transactions)).toEqual([
      { month: "2024-01", count: 2 },
      { month: "2024-02", count: 1 },
    ]);
  });

  it("ignores invalid and missing dates safely", () => {
    const session = makeAnalyticsSession();
    session.transactions = session.transactions.map((transaction) => ({
      ...transaction,
      date: undefined,
      timestamp: undefined,
    }));

    expect(groupTransactionsByMonth(session.transactions)).toEqual([]);
  });
});
