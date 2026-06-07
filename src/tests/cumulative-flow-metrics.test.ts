import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { calculateFiatFlow } from "@/lib/metrics/calculate-fiat-flow";
import { calculateCumulativeFlow } from "@/lib/metrics/calculate-cumulative-flow";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx",
    date: "2024-01-15",
    type: "deposit",
    asset: "USDT",
    amount: "100",
    fiatValue: "100",
    fiatCurrency: "USD",
    ...overrides,
  };
}

describe("calculateCumulativeFlow", () => {
  it("accumulates net flow month over month within a currency", () => {
    const flow = calculateFiatFlow([
      tx({ id: "a", date: "2024-01-10", type: "deposit", fiatValue: "1000" }), // +1000
      tx({ id: "b", date: "2024-02-10", type: "buy", fiatValue: "300" }), // −300
      tx({ id: "c", date: "2024-03-10", type: "deposit", fiatValue: "200" }), // +200
    ]);
    const result = calculateCumulativeFlow(flow);
    const usd = result.byCurrency.find((c) => c.currency === "USD");
    expect(usd?.points.map((p) => p.cumulative)).toEqual([1000, 700, 900]);
  });

  it("keeps currencies separate", () => {
    const flow = calculateFiatFlow([
      tx({ id: "a", fiatCurrency: "USD", type: "deposit", fiatValue: "1000" }),
      tx({ id: "b", fiatCurrency: "EUR", type: "deposit", fiatValue: "500" }),
    ]);
    const result = calculateCumulativeFlow(flow);
    const usd = result.byCurrency.find((c) => c.currency === "USD");
    const eur = result.byCurrency.find((c) => c.currency === "EUR");
    expect(usd?.points.at(-1)?.cumulative).toBe(1000);
    expect(eur?.points.at(-1)?.cumulative).toBe(500);
  });

  it("returns empty series for no data", () => {
    expect(calculateCumulativeFlow(calculateFiatFlow([])).byCurrency).toEqual([]);
  });
});
