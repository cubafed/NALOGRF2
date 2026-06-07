import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { createRateLookup } from "@/lib/tax/rates/convert";
import { calculateTax } from "@/lib/tax/engine/calculate-tax";
import { ruJurisdiction } from "@/lib/tax/jurisdictions/ru";
import {
  costBasisMethods,
  getCostBasisMethod,
  fifoMethod,
  lifoMethod,
  hifoMethod,
} from "@/lib/tax/methods";

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

// Two acquisitions at different prices, then sell 1 unit. The method picks which lot.
const acquisitions: Transaction[] = [
  tx({ id: "buy-early", date: "2024-01-01", type: "buy", asset: "BTC", amount: "1", fiatValue: "1000" }),
  tx({ id: "buy-late", date: "2024-02-01", type: "buy", asset: "BTC", amount: "1", fiatValue: "3000" }),
];
const sell = tx({ id: "sell", date: "2024-03-01", type: "sell", asset: "BTC", amount: "1", fiatValue: "5000" });

function gainWith(method: typeof fifoMethod): number {
  const result = calculateTax({
    transactions: [...acquisitions, sell],
    rates,
    jurisdiction: ruJurisdiction,
    method,
  });
  return result.taxableBaseReport;
}

describe("cost-basis method selection of lots", () => {
  it("FIFO consumes the earliest lot (cost 1000 → gain 4000)", () => {
    expect(gainWith(fifoMethod)).toBeCloseTo(4000, 6);
  });

  it("LIFO consumes the latest lot (cost 3000 → gain 2000)", () => {
    expect(gainWith(lifoMethod)).toBeCloseTo(2000, 6);
  });

  it("HIFO consumes the highest-cost lot (cost 3000 → gain 2000)", () => {
    expect(gainWith(hifoMethod)).toBeCloseTo(2000, 6);
  });
});

describe("HIFO vs LIFO diverge when highest cost is not the latest", () => {
  // Latest lot is the cheapest; HIFO should still pick the expensive earlier lot.
  const reversed: Transaction[] = [
    tx({ id: "buy-early", date: "2024-01-01", type: "buy", asset: "ETH", amount: "1", fiatValue: "4000" }),
    tx({ id: "buy-late", date: "2024-02-01", type: "buy", asset: "ETH", amount: "1", fiatValue: "1000" }),
  ];
  const ethSell = tx({ id: "sell", date: "2024-03-01", type: "sell", asset: "ETH", amount: "1", fiatValue: "5000" });

  it("LIFO takes the latest (cheapest) lot → gain 4000", () => {
    const r = calculateTax({ transactions: [...reversed, ethSell], rates, jurisdiction: ruJurisdiction, method: lifoMethod });
    expect(r.taxableBaseReport).toBeCloseTo(4000, 6);
  });

  it("HIFO takes the highest-cost lot → gain 1000", () => {
    const r = calculateTax({ transactions: [...reversed, ethSell], rates, jurisdiction: ruJurisdiction, method: hifoMethod });
    expect(r.taxableBaseReport).toBeCloseTo(1000, 6);
  });
});

describe("method registry", () => {
  it("exposes fifo/lifo/hifo by id", () => {
    expect(costBasisMethods.fifo.id).toBe("fifo");
    expect(costBasisMethods.lifo.id).toBe("lifo");
    expect(costBasisMethods.hifo.id).toBe("hifo");
  });

  it("getCostBasisMethod resolves known ids and rejects unknown", () => {
    expect(getCostBasisMethod("lifo")).toBe(lifoMethod);
    expect(getCostBasisMethod("acb")).toBeNull();
  });
});

describe("needs_review behaviour is shared across methods", () => {
  it("uncovered disposal is needs_review under LIFO and HIFO too", () => {
    const short = tx({ id: "sell", type: "sell", asset: "DOGE", amount: "5", fiatValue: "100" });
    for (const method of [lifoMethod, hifoMethod]) {
      const r = calculateTax({ transactions: [short], rates, jurisdiction: ruJurisdiction, method });
      expect(r.needsReviewCount).toBe(1);
      expect(r.disposals[0].reason).toBe("uncovered_disposal_no_acquisition");
    }
  });
});
