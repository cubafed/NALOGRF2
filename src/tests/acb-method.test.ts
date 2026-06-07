import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { createRateLookup } from "@/lib/tax/rates/convert";
import { calculateTax } from "@/lib/tax/engine/calculate-tax";
import { ruJurisdiction } from "@/lib/tax/jurisdictions/ru";
import { acbMethod, fifoMethod, getCostBasisMethod } from "@/lib/tax/methods";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx",
    date: "2024-01-01",
    type: "buy",
    asset: "BTC",
    amount: "1",
    fiatValue: "1000",
    fiatCurrency: "RUB",
    ...overrides,
  };
}

const rates = createRateLookup("RUB");

describe("ACB (weighted-average) method", () => {
  it("charges the pool average, not a specific lot (between FIFO and LIFO)", () => {
    // Buy 1@1000 + 1@3000 → avg 2000; sell 1@5000 → gain 5000 − 2000 = 3000.
    const txs: Transaction[] = [
      tx({ id: "b1", date: "2024-01-01", type: "buy", amount: "1", fiatValue: "1000" }),
      tx({ id: "b2", date: "2024-02-01", type: "buy", amount: "1", fiatValue: "3000" }),
      tx({ id: "s1", date: "2024-03-01", type: "sell", amount: "1", fiatValue: "5000" }),
    ];
    const acb = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: acbMethod });
    const fifo = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: fifoMethod });
    expect(acb.taxableBaseReport).toBeCloseTo(3000, 6); // average cost 2000
    expect(fifo.taxableBaseReport).toBeCloseTo(4000, 6); // earliest lot cost 1000
  });

  it("keeps the average stable across multiple disposals", () => {
    const txs: Transaction[] = [
      tx({ id: "b1", date: "2024-01-01", type: "buy", amount: "1", fiatValue: "1000" }),
      tx({ id: "b2", date: "2024-02-01", type: "buy", amount: "1", fiatValue: "3000" }),
      tx({ id: "s1", date: "2024-03-01", type: "sell", amount: "1", fiatValue: "5000" }),
      tx({ id: "s2", date: "2024-04-01", type: "sell", amount: "1", fiatValue: "4000" }),
    ];
    const r = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: acbMethod });
    // Both sells priced at avg 2000 → gains 3000 + 2000 = 5000.
    expect(r.taxableBaseReport).toBeCloseTo(5000, 6);
    expect(r.includedCount).toBe(2);
  });

  it("recomputes the average after an intervening acquisition", () => {
    // Buy 1@1000; sell 0 happens after second buy. Buy 1@1000, sell 1@x → avg still 1000.
    const txs: Transaction[] = [
      tx({ id: "b1", date: "2024-01-01", type: "buy", amount: "2", fiatValue: "2000" }), // avg 1000
      tx({ id: "s1", date: "2024-02-01", type: "sell", amount: "1", fiatValue: "1500" }), // cost 1000, gain 500
      tx({ id: "b2", date: "2024-03-01", type: "buy", amount: "1", fiatValue: "4000" }), // pool: qty2 (1@1000 +1@4000) cost 5000 avg 2500
      tx({ id: "s2", date: "2024-04-01", type: "sell", amount: "1", fiatValue: "3000" }), // cost 2500, gain 500
    ];
    const r = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: acbMethod });
    expect(r.taxableBaseReport).toBeCloseTo(1000, 6); // 500 + 500
  });

  it("flags unknown cost in the pool as needs_review", () => {
    const txs: Transaction[] = [
      // income with no fiatValue → unknown cost enters the pool
      tx({ id: "inc", date: "2024-01-01", type: "income", asset: "ETH", amount: "1", fiatValue: null }),
      tx({ id: "s1", date: "2024-02-01", type: "sell", asset: "ETH", amount: "1", fiatValue: "2000" }),
    ];
    const r = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: acbMethod });
    expect(r.needsReviewCount).toBe(1);
    expect(r.disposals[0].reason).toBe("unknown_cost_basis");
  });

  it("flags an uncovered disposal as needs_review", () => {
    const txs: Transaction[] = [
      tx({ id: "s1", date: "2024-02-01", type: "sell", asset: "SOL", amount: "5", fiatValue: "500" }),
    ];
    const r = calculateTax({ transactions: txs, rates, jurisdiction: ruJurisdiction, method: acbMethod });
    expect(r.needsReviewCount).toBe(1);
    expect(r.disposals[0].reason).toBe("uncovered_disposal_no_acquisition");
  });

  it("is resolvable from the method registry", () => {
    expect(getCostBasisMethod("acb")).toBe(acbMethod);
  });
});
