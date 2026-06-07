import { describe, it, expect } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { buildSourceOfFundsPack } from "@/lib/report/source-of-funds-pack";
import { serializeSourceOfFundsPackText } from "@/lib/report/serialize-source-of-funds-pack";

const generatedAt = "2026-06-07T00:00:00.000Z";

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

describe("supplementary letters", () => {
  it("always includes all four supplementary letters", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const keys = pack.supplementaryLetters.map((t) => t.key);
    expect(keys).toContain("mining_staking_income");
    expect(keys).toContain("crypto_income");
    expect(keys).toContain("gift_inheritance");
    expect(keys).toContain("personal_savings");
  });

  it("supplementary letters are not in letterTemplates (no duplication)", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const mainKeys = pack.letterTemplates.map((t) => t.key);
    for (const suppLetter of pack.supplementaryLetters) {
      expect(mainKeys).not.toContain(suppLetter.key);
    }
  });
});

describe("asset summary lines", () => {
  it("includes sell/p2p disposals in bank cover letter body", () => {
    const transactions = [
      tx({ id: "a", type: "sell", asset: "BTC", fiatValue: "500000", fiatCurrency: "RUB" }),
      tx({ id: "b", type: "sell", asset: "BTC", fiatValue: "300000", fiatCurrency: "RUB" }),
      tx({ id: "c", type: "p2p", asset: "ETH", fiatValue: "200000", fiatCurrency: "RUB" }),
    ];
    const pack = buildSourceOfFundsPack(transactions, [finding({})], { generatedAt });
    const coverLetter = pack.letterTemplates.find((t) => t.key === "bank_cover");
    expect(coverLetter).toBeDefined();
    expect(coverLetter!.body).toContain("BTC");
    expect(coverLetter!.body).toContain("сделок реализации");
  });

  it("does not include asset summary for non-disposal transactions", () => {
    const transactions = [
      tx({ id: "a", type: "deposit", asset: "USDT" }),
      tx({ id: "b", type: "deposit", asset: "USDC" }),
    ];
    const pack = buildSourceOfFundsPack(transactions, [finding({})], { generatedAt });
    const coverLetter = pack.letterTemplates.find((t) => t.key === "bank_cover");
    // Cover letter should exist (finding present) but have no asset summary block.
    expect(coverLetter).toBeDefined();
    expect(coverLetter!.body).not.toContain("Сводка по активам");
  });
});

describe("readiness checklist", () => {
  it("general letter is always present", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const item = pack.readiness.find((r) => r.key === "general_letter");
    expect(item?.present).toBe(true);
  });

  it("bank cover is present when there are findings", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [finding({})], { generatedAt });
    const item = pack.readiness.find((r) => r.key === "bank_cover");
    expect(item?.present).toBe(true);
  });

  it("bank cover is not present when there are no relevant findings", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const item = pack.readiness.find((r) => r.key === "bank_cover");
    expect(item?.present).toBe(false);
  });

  it("readiness has a general_letter item and documents item", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    expect(pack.readiness.some((r) => r.key === "general_letter")).toBe(true);
    expect(pack.readiness.some((r) => r.key === "documents")).toBe(true);
  });
});

describe("income count in context", () => {
  it("mining/staking letter mentions count when income transactions present", () => {
    const transactions = [
      tx({ id: "a", type: "income", asset: "BTC" }),
      tx({ id: "b", type: "income", asset: "ETH" }),
    ];
    const pack = buildSourceOfFundsPack(transactions, [], { generatedAt });
    const miningLetter = pack.supplementaryLetters.find((t) => t.key === "mining_staking_income");
    expect(miningLetter).toBeDefined();
    expect(miningLetter!.appliesWhen).toContain("2");
  });
});

describe("safety wording in new letters", () => {
  it("supplementary letter bodies avoid banned framing", () => {
    const pack = buildSourceOfFundsPack([tx({ id: "a" })], [], { generatedAt });
    const allText = pack.supplementaryLetters.map((t) => t.body).join("\n").toLowerCase();
    for (const banned of ["подозрительн", "обход контрол", "грязны", "уклонени от налог"]) {
      expect(allText).not.toContain(banned);
    }
  });
});
