import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { createRateLookup } from "@/lib/tax/rates/convert";
import { calculatePortfolio } from "@/lib/portfolio";

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

// RUB report currency; RUB converts 1:1 with no entries.
const rubRates = createRateLookup("RUB");

describe("calculatePortfolio — holdings", () => {
  it("computes remaining quantity after a partial disposal", () => {
    const result = calculatePortfolio({
      transactions: [
        tx({ id: "buy", type: "buy", asset: "BTC", amount: "2", fiatValue: "2000" }),
        tx({ id: "sell", type: "sell", asset: "BTC", amount: "1", fiatValue: "1500", date: "2024-02-01" }),
      ],
      rates: rubRates,
    });
    const btc = result.holdings.find((h) => h.asset === "BTC");
    expect(btc?.quantity).toBeCloseTo(1, 9);
    expect(btc?.costBasisReport).toBeCloseTo(1000, 6); // 1 unit @ 1000/unit remaining
  });

  it("realized P&L = proceeds − cost (FIFO)", () => {
    const result = calculatePortfolio({
      transactions: [
        tx({ id: "buy", type: "buy", asset: "ETH", amount: "1", fiatValue: "1000" }),
        tx({ id: "sell", type: "sell", asset: "ETH", amount: "1", fiatValue: "1500", date: "2024-03-01" }),
      ],
      rates: rubRates,
    });
    expect(result.totalRealizedGainReport).toBeCloseTo(500, 6);
    const eth = result.holdings.find((h) => h.asset === "ETH");
    expect(eth?.quantity).toBeCloseTo(0, 9);
    expect(eth?.realizedGainReport).toBeCloseTo(500, 6);
  });

  it("does not treat withdrawals as disposals (assets stay in holdings)", () => {
    const result = calculatePortfolio({
      transactions: [
        tx({ id: "buy", type: "buy", asset: "BTC", amount: "1", fiatValue: "1000" }),
        tx({ id: "wd", type: "withdrawal", asset: "BTC", amount: "1", date: "2024-02-01" }),
      ],
      rates: rubRates,
    });
    const btc = result.holdings.find((h) => h.asset === "BTC");
    expect(btc?.quantity).toBeCloseTo(1, 9);
    expect(result.totalRealizedGainReport).toBe(0);
  });
});

describe("calculatePortfolio — valuation", () => {
  it("computes market value and unrealized P&L from current prices", () => {
    const result = calculatePortfolio({
      transactions: [tx({ id: "buy", type: "buy", asset: "BTC", amount: "2", fiatValue: "2000" })],
      rates: rubRates,
      currentPrices: { BTC: 1500 },
    });
    const btc = result.holdings.find((h) => h.asset === "BTC");
    expect(btc?.marketValueReport).toBeCloseTo(3000, 6); // 2 × 1500
    expect(btc?.unrealizedGainReport).toBeCloseTo(1000, 6); // 3000 − 2000
    expect(result.totalUnrealizedGainReport).toBeCloseTo(1000, 6);
  });

  it("leaves market value null when no price is supplied", () => {
    const result = calculatePortfolio({
      transactions: [tx({ id: "buy", type: "buy", asset: "BTC", amount: "1", fiatValue: "1000" })],
      rates: rubRates,
    });
    const btc = result.holdings.find((h) => h.asset === "BTC");
    expect(btc?.marketValueReport).toBeNull();
    expect(btc?.unrealizedGainReport).toBeNull();
    expect(result.totalMarketValueReport).toBeNull();
    expect(result.warnings.some((w) => w.includes("текущей цены"))).toBe(true);
  });

  it("flags unknown cost basis without guessing", () => {
    const result = calculatePortfolio({
      transactions: [
        // income with no fiatValue → unknown acquisition cost
        tx({ id: "inc", type: "income", asset: "SOL", amount: "10", fiatValue: null }),
      ],
      rates: rubRates,
      currentPrices: { SOL: 50 },
    });
    const sol = result.holdings.find((h) => h.asset === "SOL");
    expect(sol?.hasUnknownCost).toBe(true);
    expect(sol?.costBasisReport).toBeNull();
    expect(sol?.marketValueReport).toBeCloseTo(500, 6); // price still applies
    expect(sol?.unrealizedGainReport).toBeNull(); // cost unknown → cannot compute
  });
});

describe("calculatePortfolio — guards and currency", () => {
  it("throws on non-array transactions", () => {
    // @ts-expect-error testing runtime guard
    expect(() => calculatePortfolio({ transactions: null, rates: rubRates })).toThrow(TypeError);
  });

  it("converts foreign-currency cost using the rate table", () => {
    const usdRates = createRateLookup("RUB", [
      { currency: "USD", date: "2024-01-01", rateToReport: 90 },
    ]);
    const result = calculatePortfolio({
      transactions: [
        tx({ id: "buy", type: "buy", asset: "BTC", amount: "1", fiatValue: "100", fiatCurrency: "USD" }),
      ],
      rates: usdRates,
      currentPrices: { BTC: 10000 },
    });
    const btc = result.holdings.find((h) => h.asset === "BTC");
    expect(btc?.costBasisReport).toBeCloseTo(9000, 6); // 100 USD × 90
    expect(btc?.unrealizedGainReport).toBeCloseTo(1000, 6); // 10000 − 9000
  });

  it("reports the report currency from the rate lookup", () => {
    const result = calculatePortfolio({ transactions: [], rates: rubRates });
    expect(result.reportCurrency).toBe("RUB");
    expect(result.holdings).toEqual([]);
  });
});
