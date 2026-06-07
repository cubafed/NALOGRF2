import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { buildSourceOfFundsPack } from "@/lib/report/source-of-funds-pack";
import {
  serializeSourceOfFundsPackText,
  serializeSourceOfFundsPackJson,
} from "@/lib/report/serialize-source-of-funds-pack";

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

const generatedAt = "2026-06-06T00:00:00.000Z";

describe("serializeSourceOfFundsPackText", () => {
  it("renders all sections with the disclaimer and period", () => {
    const pack = buildSourceOfFundsPack(
      [tx({ id: "a", fiatValue: "1500", fiatCurrency: "USD", source: "Binance" })],
      [finding({ ruleId: "large_p2p_inflow" })],
      { generatedAt },
    );
    const text = serializeSourceOfFundsPackText(pack);

    expect(text).toContain("# Пакет подтверждения источника средств");
    expect(text).toContain("Период операций:");
    expect(text).toContain(pack.disclaimer);
    expect(text).toContain("## Поступления по источникам");
    expect(text).toContain("## Может потребовать пояснения");
    expect(text).toContain("## Документы для пакета");
    expect(text).toContain("## Черновики пояснительных писем");
    // The general letter is always present.
    expect(text).toContain("Пояснение об источнике средств");
  });

  it("keeps currencies separate in the inflow section", () => {
    const pack = buildSourceOfFundsPack(
      [
        tx({ id: "a", fiatValue: "1000", fiatCurrency: "USD", source: "Binance" }),
        tx({ id: "b", fiatValue: "300", fiatCurrency: "EUR", source: "Binance" }),
      ],
      [],
      { generatedAt },
    );
    const text = serializeSourceOfFundsPackText(pack);
    expect(text).toContain("USD");
    expect(text).toContain("EUR");
    // No combined cross-currency total line.
    expect(text).not.toMatch(/итого по всем валютам/i);
  });

  it("handles an empty package without throwing", () => {
    const pack = buildSourceOfFundsPack([], [], { generatedAt });
    const text = serializeSourceOfFundsPackText(pack);
    expect(text).toContain("Нет поступлений в загруженных данных.");
    expect(text).toContain("Пунктов, требующих пояснения, не выявлено.");
  });
});

describe("serializeSourceOfFundsPackJson", () => {
  it("produces valid JSON round-tripping the pack", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const json = serializeSourceOfFundsPackJson(pack);
    const parsed = JSON.parse(json);
    expect(parsed.generatedAt).toBe(generatedAt);
    expect(Array.isArray(parsed.letterTemplates)).toBe(true);
  });
});
