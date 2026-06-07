import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { calculateTax } from "@/lib/tax/engine/calculate-tax";
import { createRateLookup, convertToReport } from "@/lib/tax/rates/convert";
import { ruJurisdiction, RU_TAX_BRACKETS } from "@/lib/tax/jurisdictions/ru";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx",
    date: "2024-03-01",
    type: "buy",
    asset: "BTC",
    amount: "1",
    fiatCurrency: "RUB",
    ...overrides,
  };
}

// All amounts already in RUB unless a test supplies a rate table.
const rubRates = createRateLookup("RUB");

function run(transactions: Transaction[], opts: { rates?: ReturnType<typeof createRateLookup>; manual?: ManualCostBasisByTransactionId } = {}) {
  return calculateTax({
    transactions,
    rates: opts.rates ?? rubRates,
    jurisdiction: ruJurisdiction,
    manualCostBasis: opts.manual,
  });
}

describe("convertToReport", () => {
  it("returns the amount unchanged for the report currency", () => {
    expect(convertToReport(100, "RUB", "2024-03-01", rubRates)).toBe(100);
  });

  it("returns null when no rate is available", () => {
    expect(convertToReport(100, "USD", "2024-03-01", rubRates)).toBeNull();
  });

  it("applies a supplied daily rate", () => {
    const rates = createRateLookup("RUB", [
      { currency: "USD", date: "2024-03-01", rateToReport: 90 },
    ]);
    expect(convertToReport(100, "USD", "2024-03-01", rates)).toBe(9000);
  });
});

describe("calculateTax — FIFO core", () => {
  it("matches a sell to a prior buy and computes the gain", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", date: "2024-02-01" }),
    ]);

    expect(result.includedCount).toBe(1);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("included");
    expect(sell?.costBasisReport).toBe(1000);
    expect(sell?.gainReport).toBe(500);
    expect(result.taxableBaseReport).toBe(500);
  });

  it("consumes the earliest lots first (FIFO order)", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({ id: "buy-2", type: "buy", amount: "1", fiatValue: "2000", date: "2024-02-01" }),
      tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", date: "2024-03-01" }),
    ]);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    // First lot (1000) consumed, not the 2000 one.
    expect(sell?.costBasisReport).toBe(1000);
    expect(sell?.gainReport).toBe(500);
  });

  it("flags a disposal that exceeds available lots as needs_review (uncovered)", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({ id: "sell-1", type: "sell", amount: "3", fiatValue: "4500", date: "2024-02-01" }),
    ]);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("needs_review");
    expect(sell?.reason).toBe("uncovered_disposal_no_acquisition");
    expect(sell?.uncoveredQuantity).toBe(2);
    expect(result.taxableBaseReport).toBe(0);
  });

  it("flags a disposal with unknown lot cost as needs_review", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: null, date: "2024-01-01" }),
      tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", date: "2024-02-01" }),
    ]);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("needs_review");
    expect(sell?.reason).toBe("unknown_cost_basis");
  });

  it("flags a disposal missing fiat proceeds as needs_review", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: null, date: "2024-02-01" }),
    ]);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("needs_review");
    expect(sell?.reason).toBe("missing_fiat_proceeds");
  });

  it("uses a manual cost basis override when history has no cost", () => {
    const manual: ManualCostBasisByTransactionId = {
      "buy-1": { transactionId: "buy-1", costBasisFiat: "800", updatedAt: "x" },
    };
    const result = run(
      [
        tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: null, date: "2024-01-01" }),
        tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", date: "2024-02-01" }),
      ],
      { manual },
    );
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("included");
    expect(sell?.costBasisReport).toBe(800);
    expect(sell?.gainReport).toBe(700);
  });

  it("subtracts a fiat-denominated fee from the gain", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({
        id: "sell-1",
        type: "sell",
        amount: "1",
        fiatValue: "1500",
        feeAmount: "50",
        feeAsset: "RUB",
        date: "2024-02-01",
      }),
    ]);
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.feeReport).toBe(50);
    expect(sell?.gainReport).toBe(450);
  });
});

describe("calculateTax — currency conversion", () => {
  it("converts USD proceeds and cost to RUB at the date rate", () => {
    const rates = createRateLookup("RUB", [
      { currency: "USD", date: "2024-01-01", rateToReport: 90 },
      { currency: "USD", date: "2024-02-01", rateToReport: 100 },
    ]);
    const result = run(
      [
        tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", fiatCurrency: "USD", date: "2024-01-01" }),
        tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", fiatCurrency: "USD", date: "2024-02-01" }),
      ],
      { rates },
    );
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    // cost 1000 USD * 90 = 90000 RUB; proceeds 1500 USD * 100 = 150000 RUB.
    expect(sell?.costBasisReport).toBe(90_000);
    expect(sell?.proceedsReport).toBe(150_000);
    expect(sell?.gainReport).toBe(60_000);
  });

  it("flags needs_review when the date rate is missing", () => {
    const rates = createRateLookup("RUB", [
      { currency: "USD", date: "2024-01-01", rateToReport: 90 },
      // no rate for 2024-02-01
    ]);
    const result = run(
      [
        tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", fiatCurrency: "USD", date: "2024-01-01" }),
        tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", fiatCurrency: "USD", date: "2024-02-01" }),
      ],
      { rates },
    );
    const sell = result.disposals.find((d) => d.transactionId === "sell-1");
    expect(sell?.status).toBe("needs_review");
    expect(sell?.reason).toBe("missing_fiat_proceeds");
  });
});

describe("RU jurisdiction — progressive NDFL", () => {
  it("applies 13% below the threshold", () => {
    const { taxAmountReport } = ruJurisdiction.computeTax(1_000_000);
    expect(taxAmountReport).toBeCloseTo(130_000, 6);
  });

  it("applies 13%/15% across the threshold", () => {
    const threshold = RU_TAX_BRACKETS[0].upTo as number; // 5,000,000
    const base = threshold + 1_000_000; // 6,000,000
    const { taxAmountReport, appliedBrackets } = ruJurisdiction.computeTax(base);
    // 5,000,000 * 13% + 1,000,000 * 15%
    expect(taxAmountReport).toBeCloseTo(650_000 + 150_000, 6);
    expect(appliedBrackets).toHaveLength(2);
  });

  it("returns zero tax for a non-positive base (losses create no liability)", () => {
    expect(ruJurisdiction.computeTax(0).taxAmountReport).toBe(0);
    expect(ruJurisdiction.computeTax(-500).taxAmountReport).toBe(0);
  });

  it("nets gains and losses within the engine before applying the rate", () => {
    const result = run([
      tx({ id: "buy-1", type: "buy", amount: "1", fiatValue: "1000", date: "2024-01-01" }),
      tx({ id: "sell-1", type: "sell", amount: "1", fiatValue: "1500", date: "2024-02-01" }), // +500
      tx({ id: "buy-2", type: "buy", amount: "1", fiatValue: "2000", date: "2024-03-01" }),
      tx({ id: "sell-2", type: "sell", amount: "1", fiatValue: "1700", date: "2024-04-01" }), // -300
    ]);
    expect(result.taxableBaseReport).toBe(200);
    expect(result.taxAmountReport).toBeCloseTo(26, 6); // 200 * 13%
  });
});

describe("calculateTax — guards", () => {
  it("throws when transactions is not an array", () => {
    expect(() =>
      calculateTax({
        transactions: {} as unknown as Transaction[],
        rates: rubRates,
        jurisdiction: ruJurisdiction,
      }),
    ).toThrow(TypeError);
  });

  it("throws when rate report currency mismatches the jurisdiction", () => {
    expect(() =>
      calculateTax({
        transactions: [],
        rates: createRateLookup("USD"),
        jurisdiction: ruJurisdiction,
      }),
    ).toThrow(/report currency/);
  });
});
