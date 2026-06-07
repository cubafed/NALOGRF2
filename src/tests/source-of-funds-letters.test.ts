import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { buildSourceOfFundsPack } from "@/lib/report/source-of-funds-pack";
import { serializeSourceOfFundsPackText } from "@/lib/report/serialize-source-of-funds-pack";

const generatedAt = "2026-06-06T00:00:00.000Z";

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
    title: "Заголовок",
    explanation: "explanation",
    whyItMatters: "Банк может запросить пояснение.",
    recommendedAction: "Подготовьте документы.",
    documentsNeeded: ["bank statement"],
    affectedTransactionIds: ["tx-1"],
    affectedRawRowNumbers: [1],
    status: "open",
    createdBy: "risk_engine_v1",
    ...overrides,
  };
}

function keys(pack: ReturnType<typeof buildSourceOfFundsPack>): string[] {
  return pack.letterTemplates.map((t) => t.key);
}

describe("bank cover letter", () => {
  it("is included whenever there is something that may need explanation", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [finding({})], { generatedAt });
    expect(keys(pack)).toContain("bank_cover");
  });

  it("is absent when there are no relevant findings", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    expect(keys(pack)).not.toContain("bank_cover");
    // The general letter is still always present.
    expect(keys(pack)).toContain("source_of_funds_general");
  });
});

describe("rule-specific letters", () => {
  it("adds a rapid_transit letter for the rapid_transit rule", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [finding({ ruleId: "rapid_transit", title: "Быстрый транзит" })],
      { generatedAt },
    );
    expect(keys(pack)).toContain("rapid_transit");
  });

  it("adds a concentrated_counterparty letter for that rule", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [finding({ ruleId: "concentrated_counterparty", title: "Один контрагент" })],
      { generatedAt },
    );
    expect(keys(pack)).toContain("concentrated_counterparty");
  });

  it("includes the P2P letter for high_p2p_share as well as large_p2p_inflow", () => {
    const high = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [finding({ ruleId: "high_p2p_share", title: "Высокая доля P2P" })],
      { generatedAt },
    );
    expect(keys(high)).toContain("p2p_nature");
  });
});

describe("operations summary", () => {
  it("counts operations by type and total", () => {
    const pack = buildSourceOfFundsPack(
      [
        tx({ id: "a", type: "p2p" }),
        tx({ id: "b", type: "p2p" }),
        tx({ id: "c", type: "withdrawal", fiatValue: "500" }),
      ],
      [],
      { generatedAt },
    );
    expect(pack.operationsSummary.totalOperations).toBe(3);
    const p2p = pack.operationsSummary.byType.find((r) => r.type === "p2p");
    expect(p2p?.count).toBe(2);
  });

  it("renders the operations summary in the Markdown export", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const text = serializeSourceOfFundsPackText(pack);
    expect(text).toContain("## Сводка операций");
    expect(text).toContain("Всего операций: 1");
  });
});

describe("safety wording", () => {
  it("new letter bodies avoid banned framing", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a" })],
      [
        finding({ ruleId: "rapid_transit" }),
        finding({ ruleId: "concentrated_counterparty" }),
        finding({ ruleId: "large_p2p_inflow" }),
      ],
      { generatedAt },
    );
    const allText = pack.letterTemplates.map((t) => t.body).join("\n").toLowerCase();
    for (const banned of ["подозрительн", "обход контрол", "грязны", "уклонени от налог"]) {
      expect(allText).not.toContain(banned);
    }
  });
});
