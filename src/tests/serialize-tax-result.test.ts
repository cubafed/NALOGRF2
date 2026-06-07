import { describe, it, expect } from "vitest";
import { serializeTaxResultText, serializeTaxResultJson } from "@/lib/tax/serialize-tax-result";
import type { TaxEngineResult } from "@/lib/tax/engine/engine-types";

function makeResult(overrides: Partial<TaxEngineResult> = {}): TaxEngineResult {
  return {
    jurisdiction: "ru_resident",
    reportCurrency: "RUB",
    method: "fifo",
    disposals: [
      {
        transactionId: "tx1",
        asset: "BTC",
        date: "2024-03-01",
        quantity: 0.5,
        proceedsReport: 3250000,
        feeReport: 0,
        matched: [],
        coveredQuantity: 0.5,
        uncoveredQuantity: 0,
        costBasisReport: 2000000,
        gainReport: 1250000,
        status: "included",
        reason: "ok",
      },
    ],
    taxableBaseReport: 1250000,
    taxAmountReport: 162500,
    appliedBrackets: [{ upTo: 5000000, rate: 0.13, baseInBracket: 1250000, taxInBracket: 162500 }],
    includedCount: 1,
    needsReviewCount: 0,
    excludedCount: 0,
    warnings: [],
    ...overrides,
  };
}

describe("serializeTaxResultText", () => {
  it("contains key sections", () => {
    const text = serializeTaxResultText(makeResult(), "2026-06-07T00:00:00.000Z");
    expect(text).toContain("# Предварительный налоговый расчёт");
    expect(text).toContain("## Итог");
    expect(text).toContain("## Расчёт по ставкам");
    expect(text).toContain("## Операции реализации");
  });

  it("includes disclaimer", () => {
    const text = serializeTaxResultText(makeResult());
    expect(text.toLowerCase()).toContain("предварительный");
    expect(text).toContain("бухгалтером");
  });

  it("shows tax amount in RUB", () => {
    const text = serializeTaxResultText(makeResult());
    expect(text).toContain("162");
    expect(text).toContain("RUB");
  });

  it("shows disposal row with asset and date", () => {
    const text = serializeTaxResultText(makeResult());
    expect(text).toContain("BTC");
    expect(text).toContain("2024-03-01");
  });

  it("does not contain banned phrases", () => {
    const text = serializeTaxResultText(makeResult()).toLowerCase();
    for (const banned of ["подозрительн", "уклонени", "обход"]) {
      expect(text).not.toContain(banned);
    }
  });
});

describe("serializeTaxResultJson", () => {
  it("is valid JSON with required fields", () => {
    const json = serializeTaxResultJson(makeResult(), "2026-06-07T00:00:00.000Z");
    const parsed = JSON.parse(json);
    expect(parsed.jurisdiction).toBe("ru_resident");
    expect(parsed.taxAmountReport).toBe(162500);
    expect(parsed.disposals).toHaveLength(1);
    expect(parsed.generatedAt).toBe("2026-06-07T00:00:00.000Z");
  });
});
