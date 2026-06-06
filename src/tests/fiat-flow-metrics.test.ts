import { describe, it, expect } from "vitest";
import { calculateFiatFlow } from "@/lib/metrics/calculate-fiat-flow";
import type { Transaction } from "@/lib/domain/types";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    type: "buy",
    asset: "BTC",
    amount: "1",
    ...overrides,
  };
}

describe("calculateFiatFlow", () => {
  it("groups inflow and outflow by month for a single currency", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "sell", date: "2024-03-01", fiatValue: "1000", fiatCurrency: "USD" }),
      tx({ id: "b", type: "buy", date: "2024-03-15", fiatValue: "600", fiatCurrency: "USD" }),
      tx({ id: "c", type: "sell", date: "2024-04-01", fiatValue: "500", fiatCurrency: "USD" }),
    ]);
    expect(result.byCurrency).toHaveLength(1);
    const usd = result.byCurrency[0];
    expect(usd.currency).toBe("USD");
    const mar = usd.months.find((m) => m.month === "2024-03");
    expect(mar?.inflow).toBe(1000);
    expect(mar?.outflow).toBe(600);
    expect(mar?.net).toBe(400);
    const apr = usd.months.find((m) => m.month === "2024-04");
    expect(apr?.inflow).toBe(500);
    expect(result.missingFiatValueCount).toBe(0);
  });

  it("counts null fiatValue as missing and skips it", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "sell", date: "2024-03-01", fiatValue: null, fiatCurrency: "USD" }),
      tx({ id: "b", type: "sell", date: "2024-03-01", fiatValue: undefined, fiatCurrency: "USD" }),
      tx({ id: "c", type: "sell", date: "2024-03-01", fiatValue: "", fiatCurrency: "USD" }),
    ]);
    expect(result.missingFiatValueCount).toBe(3);
    expect(result.byCurrency).toHaveLength(0);
  });

  it("counts non-numeric fiatValue as missing and skips it", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "sell", date: "2024-03-01", fiatValue: "not-a-number", fiatCurrency: "USD" }),
    ]);
    expect(result.missingFiatValueCount).toBe(1);
    expect(result.byCurrency).toHaveLength(0);
  });

  it("groups separately by currency when multiple currencies present", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "sell", date: "2024-03-01", fiatValue: "1000", fiatCurrency: "USD" }),
      tx({ id: "b", type: "sell", date: "2024-03-01", fiatValue: "900", fiatCurrency: "EUR" }),
    ]);
    expect(result.byCurrency).toHaveLength(2);
    const currencies = result.byCurrency.map((c) => c.currency);
    expect(currencies).toContain("USD");
    expect(currencies).toContain("EUR");
  });

  it("classifies sell/deposit/p2p/income as inflow", () => {
    const types = ["sell", "deposit", "p2p", "income"] as const;
    for (const type of types) {
      const result = calculateFiatFlow([
        tx({ id: type, type, date: "2024-03-01", fiatValue: "100", fiatCurrency: "USD" }),
      ]);
      const usd = result.byCurrency[0];
      expect(usd.months[0].inflow).toBe(100);
      expect(usd.months[0].outflow).toBe(0);
    }
  });

  it("classifies buy/withdrawal/fee as outflow", () => {
    const types = ["buy", "withdrawal", "fee"] as const;
    for (const type of types) {
      const result = calculateFiatFlow([
        tx({ id: type, type, date: "2024-03-01", fiatValue: "100", fiatCurrency: "USD" }),
      ]);
      const usd = result.byCurrency[0];
      expect(usd.months[0].outflow).toBe(100);
      expect(usd.months[0].inflow).toBe(0);
    }
  });

  it("classifies transfer/conversion/unknown as unclassified and excludes from totals", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "transfer", date: "2024-03-01", fiatValue: "100", fiatCurrency: "USD" }),
      tx({ id: "b", type: "conversion", date: "2024-03-01", fiatValue: "100", fiatCurrency: "USD" }),
      tx({ id: "c", type: "unknown", date: "2024-03-01", fiatValue: "100", fiatCurrency: "USD" }),
    ]);
    expect(result.unclassifiedTypeCount).toBe(3);
    expect(result.byCurrency).toHaveLength(0);
  });

  it("handles missing/invalid date by bucketing as unknown-date", () => {
    const result = calculateFiatFlow([
      tx({ id: "a", type: "sell", date: undefined, timestamp: undefined, fiatValue: "100", fiatCurrency: "USD" }),
    ]);
    const usd = result.byCurrency[0];
    expect(usd.months[0].month).toBe("unknown-date");
    expect(usd.months[0].inflow).toBe(100);
  });
});
