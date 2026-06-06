import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import {
  buildSourceOfFundsPack,
  SOURCE_OF_FUNDS_DISCLAIMER,
} from "@/lib/report/source-of-funds-pack";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx",
    date: "2024-04-02",
    type: "p2p",
    asset: "USDT",
    amount: "1000",
    fiatValue: "1000",
    fiatCurrency: "USD",
    source: "Binance P2P",
    ...overrides,
  };
}

function finding(overrides: Partial<RiskFinding>): RiskFinding {
  return {
    id: "risk-x",
    ruleId: "large_p2p_inflow",
    severity: "medium",
    title: "Крупная P2P-операция требует проверки",
    explanation: "explanation",
    whyItMatters: "Банк может запросить подтверждение происхождения средств.",
    recommendedAction: "Сохраните подтверждение P2P-сделки.",
    documentsNeeded: ["P2P order proof", "bank statement"],
    affectedTransactionIds: ["tx-1"],
    affectedRawRowNumbers: [1],
    status: "open",
    createdBy: "risk_engine_v1",
    ...overrides,
  };
}

describe("buildSourceOfFundsPack — inflow grouping", () => {
  it("groups inflow by source and currency without mixing currencies", () => {
    const pack = buildSourceOfFundsPack(
      [
        tx({ id: "a", source: "Binance", fiatValue: "1000", fiatCurrency: "USD" }),
        tx({ id: "b", source: "Binance", fiatValue: "500", fiatCurrency: "USD" }),
        tx({ id: "c", source: "Binance", fiatValue: "300", fiatCurrency: "EUR" }),
      ],
      [],
      { generatedAt: "2026-06-06T00:00:00.000Z" },
    );

    const usd = pack.inflowBySource.find((i) => i.source === "Binance" && i.currency === "USD");
    const eur = pack.inflowBySource.find((i) => i.source === "Binance" && i.currency === "EUR");
    expect(usd?.totalInflow).toBe(1500);
    expect(usd?.operationCount).toBe(2);
    expect(eur?.totalInflow).toBe(300);
    // Sorted by total descending: USD block first.
    expect(pack.inflowBySource[0].currency).toBe("USD");
  });

  it("labels missing source as unknown and skips non-numeric fiat values", () => {
    const pack = buildSourceOfFundsPack(
      [
        tx({ id: "a", source: "", fiatValue: "1000" }),
        tx({ id: "b", source: "Binance", fiatValue: null }),
      ],
      [],
    );
    expect(pack.inflowBySource).toHaveLength(1);
    expect(pack.inflowBySource[0].source).toBe("Неизвестный источник");
  });

  it("only counts inflow operation types", () => {
    const pack = buildSourceOfFundsPack(
      [
        tx({ id: "a", type: "sell", fiatValue: "1000" }),
        tx({ id: "b", type: "withdrawal", fiatValue: "1000" }), // outflow — excluded
        tx({ id: "c", type: "buy", fiatValue: "1000" }), // not an inflow of value
      ],
      [],
    );
    const total = pack.inflowBySource.reduce((sum, i) => sum + i.totalInflow, 0);
    expect(total).toBe(1000);
  });
});

describe("buildSourceOfFundsPack — explanation items and templates", () => {
  it("includes only source-of-funds-relevant findings", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [
        finding({ id: "f1", ruleId: "large_p2p_inflow" }),
        finding({ id: "f2", ruleId: "unknown_transaction_type" }), // not relevant
      ],
    );
    expect(pack.itemsThatMayNeedExplanation.map((i) => i.ruleId)).toEqual(["large_p2p_inflow"]);
  });

  it("always provides the general letter and adds scenario letters per finding", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [
        finding({ id: "f1", ruleId: "large_p2p_inflow", affectedTransactionIds: ["a"] }),
        finding({ id: "f2", ruleId: "unknown_source_wallet", affectedTransactionIds: ["a"] }),
        finding({ id: "f3", ruleId: "large_fiat_withdrawal", affectedTransactionIds: ["a"] }),
      ],
    );
    const keys = pack.letterTemplates.map((t) => t.key);
    expect(keys).toContain("source_of_funds_general");
    expect(keys).toContain("p2p_nature");
    expect(keys).toContain("wallet_ownership");
    expect(keys).toContain("large_disposal");
  });

  it("omits scenario letters when their finding is absent", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], []);
    const keys = pack.letterTemplates.map((t) => t.key);
    expect(keys).toEqual(["source_of_funds_general"]);
  });

  it("builds a document checklist from the relevant findings", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [finding({ ruleId: "large_p2p_inflow" })],
    );
    expect(pack.documentChecklist.length).toBeGreaterThan(0);
  });
});

describe("buildSourceOfFundsPack — period and metadata", () => {
  it("derives a single year and a multi-year range", () => {
    const single = buildSourceOfFundsPack([tx({ date: "2024-01-01" })], []);
    expect(single.periodLabel).toBe("2024");

    const range = buildSourceOfFundsPack(
      [tx({ id: "a", date: "2024-01-01" }), tx({ id: "b", date: "2025-06-01" })],
      [],
    );
    expect(range.periodLabel).toBe("2024–2025");
  });

  it("honors an injected generatedAt and carries the disclaimer", () => {
    const pack = buildSourceOfFundsPack([], [], { generatedAt: "2026-06-06T00:00:00.000Z" });
    expect(pack.generatedAt).toBe("2026-06-06T00:00:00.000Z");
    expect(pack.disclaimer).toBe(SOURCE_OF_FUNDS_DISCLAIMER);
  });

  it("throws when inputs are not arrays", () => {
    expect(() =>
      buildSourceOfFundsPack({} as unknown as Transaction[], []),
    ).toThrow(TypeError);
    expect(() =>
      buildSourceOfFundsPack([], {} as unknown as RiskFinding[]),
    ).toThrow(TypeError);
  });
});
