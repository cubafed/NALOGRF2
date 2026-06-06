import { describe, expect, it } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { calculatePreliminaryTaxEstimate } from "@/lib/tax/calculate-preliminary-tax-estimate";
import { classifyTaxEvents } from "@/lib/tax/classify-tax-events";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    date: "2024-04-02",
    type: "sell",
    asset: "ETH",
    amount: "1",
    fiatValue: "1000",
    fiatCurrency: "USD",
    ...overrides,
  };
}

function estimate(
  transactions: Transaction[],
  manualCostBasis: ManualCostBasisByTransactionId = {},
) {
  return calculatePreliminaryTaxEstimate(
    transactions,
    classifyTaxEvents(transactions),
    manualCostBasis,
  );
}

describe("calculatePreliminaryTaxEstimate", () => {
  it("includes supported sell operations with manual cost basis", () => {
    const result = estimate(
      [tx({ id: "sell-1", feeAmount: "10", feeAsset: "USD" })],
      {
        "sell-1": {
          transactionId: "sell-1",
          costBasisFiat: "600",
          fiatCurrency: "USD",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    );

    expect(result.lines[0]).toMatchObject({
      transactionId: "sell-1",
      status: "included",
      proceedsFiat: 1000,
      manualCostBasisFiat: 600,
      feeFiat: 10,
      preliminaryTaxableResultFiat: 390,
    });
    expect(result.summary).toMatchObject({
      includedOperations: 1,
      totalProceedsFiat: 1000,
      totalManualCostBasisFiat: 600,
      totalFeesFiat: 10,
      preliminaryTaxableResultFiat: 390,
    });
  });

  it("excludes supported sell operations when manual cost basis is missing", () => {
    const result = estimate([tx({ id: "sell-missing-basis" })]);

    expect(result.lines[0]).toMatchObject({
      transactionId: "sell-missing-basis",
      status: "excluded",
      reasonCode: "missing_manual_cost_basis",
      preliminaryTaxableResultFiat: null,
    });
    expect(result.summary.excludedOperations).toBe(1);
    expect(result.summary.preliminaryTaxableResultFiat).toBe(0);
  });

  it("marks supported operations with missing fiat proceeds as needs_review", () => {
    const result = estimate([
      tx({ id: "sell-missing-fiat", fiatValue: null, fiatCurrency: "USD" }),
    ]);

    expect(result.lines[0]).toMatchObject({
      transactionId: "sell-missing-fiat",
      status: "needs_review",
      reasonCode: "missing_fiat_proceeds",
      proceedsFiat: null,
    });
    expect(result.summary.needsReviewOperations).toBe(1);
  });

  it("includes supported P2P sale operations when proceeds and manual cost basis are present", () => {
    const result = estimate(
      [tx({ id: "p2p-1", type: "p2p", asset: "USDT", amount: "500", fiatValue: "500" })],
      {
        "p2p-1": {
          transactionId: "p2p-1",
          costBasisFiat: "430",
          fiatCurrency: "USD",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    );

    expect(result.lines[0]).toMatchObject({
      transactionId: "p2p-1",
      status: "included",
      proceedsFiat: 500,
      manualCostBasisFiat: 430,
      preliminaryTaxableResultFiat: 70,
    });
  });

  it("excludes unsupported and non-taxable operations without dropping rows", () => {
    const transactions = [
      tx({ id: "buy-1", type: "buy", fiatValue: "1000" }),
      tx({ id: "conversion-1", type: "conversion", fiatValue: "1000" }),
      tx({ id: "unknown-1", type: "unknown", fiatValue: "1000" }),
    ];

    const result = estimate(transactions);

    expect(result.lines).toHaveLength(transactions.length);
    expect(result.lines.map((line) => line.status)).toEqual([
      "excluded",
      "excluded",
      "excluded",
    ]);
    expect(result.lines.map((line) => line.transactionId)).toEqual([
      "buy-1",
      "conversion-1",
      "unknown-1",
    ]);
  });

  it("reports per-currency totals and a dominant currency without mixing currencies", () => {
    const transactions = [
      tx({ id: "usd-1", fiatValue: "1000", fiatCurrency: "USD" }),
      tx({ id: "usd-2", fiatValue: "800", fiatCurrency: "USD" }),
      tx({ id: "eur-1", fiatValue: "500", fiatCurrency: "EUR" }),
    ];
    const manual: ManualCostBasisByTransactionId = {
      "usd-1": { transactionId: "usd-1", costBasisFiat: "600", updatedAt: "x" },
      "usd-2": { transactionId: "usd-2", costBasisFiat: "500", updatedAt: "x" },
      "eur-1": { transactionId: "eur-1", costBasisFiat: "300", updatedAt: "x" },
    };

    const { summary } = estimate(transactions, manual);

    expect(summary.byCurrency).toHaveLength(2);
    const usd = summary.byCurrency.find((c) => c.fiatCurrency === "USD");
    const eur = summary.byCurrency.find((c) => c.fiatCurrency === "EUR");
    expect(usd?.includedOperations).toBe(2);
    expect(usd?.preliminaryTaxableResultFiat).toBe(700); // (1000-600)+(800-500)
    expect(eur?.preliminaryTaxableResultFiat).toBe(200); // 500-300
    // Dominant currency = the one with the most included operations.
    expect(summary.fiatCurrency).toBe("USD");
  });

  it("throws only when transactions or classifications are not arrays", () => {
    expect(() =>
      calculatePreliminaryTaxEstimate({} as unknown as Transaction[], [], {}),
    ).toThrow(TypeError);
    expect(() =>
      calculatePreliminaryTaxEstimate([], {} as Parameters<typeof calculatePreliminaryTaxEstimate>[1], {}),
    ).toThrow(TypeError);
  });
});
