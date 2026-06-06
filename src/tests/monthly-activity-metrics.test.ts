import { describe, it, expect } from "vitest";
import { calculateMonthlyActivity } from "@/lib/metrics/calculate-monthly-activity";
import type { Transaction } from "@/lib/domain/types";

function tx(overrides: Partial<Transaction>): Transaction {
  return { id: "tx-1", type: "buy", asset: "BTC", amount: "1", ...overrides };
}

describe("calculateMonthlyActivity", () => {
  it("groups transaction counts by month (YYYY-MM)", () => {
    const result = calculateMonthlyActivity([
      tx({ id: "a", date: "2024-03-01" }),
      tx({ id: "b", date: "2024-03-15" }),
      tx({ id: "c", date: "2024-04-01" }),
    ]);
    const mar = result.buckets.find((b) => b.month === "2024-03");
    expect(mar?.count).toBe(2);
    const apr = result.buckets.find((b) => b.month === "2024-04");
    expect(apr?.count).toBe(1);
    expect(result.invalidDateCount).toBe(0);
  });

  it("produces Russian month labels", () => {
    const result = calculateMonthlyActivity([
      tx({ id: "a", date: "2024-03-01" }),
    ]);
    const mar = result.buckets.find((b) => b.month === "2024-03");
    // Russian short month for March — "мар." or "мар" depending on locale
    expect(mar?.label).toMatch(/мар/i);
    expect(mar?.label).toContain("2024");
  });

  it("counts invalid/missing dates in invalidDateCount with invalid-date bucket last", () => {
    const result = calculateMonthlyActivity([
      tx({ id: "a", date: "2024-03-01" }),
      tx({ id: "b", date: undefined, timestamp: undefined }),
      tx({ id: "c", date: "not-a-date", timestamp: undefined }),
    ]);
    expect(result.invalidDateCount).toBe(2);
    const last = result.buckets[result.buckets.length - 1];
    expect(last.month).toBe("invalid-date");
    expect(last.label).toBe("Неверная дата");
  });

  it("sorts valid buckets chronologically, invalid-date bucket always last", () => {
    const result = calculateMonthlyActivity([
      tx({ id: "a", date: "2024-05-01" }),
      tx({ id: "b", date: undefined }),
      tx({ id: "c", date: "2024-03-01" }),
      tx({ id: "d", date: "2024-04-01" }),
    ]);
    const validBuckets = result.buckets.filter((b) => b.month !== "invalid-date");
    expect(validBuckets[0].month).toBe("2024-03");
    expect(validBuckets[1].month).toBe("2024-04");
    expect(validBuckets[2].month).toBe("2024-05");
    expect(result.buckets[result.buckets.length - 1].month).toBe("invalid-date");
  });
});
