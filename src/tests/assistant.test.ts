import { describe, it, expect } from "vitest";
import {
  buildAssistantContext,
  summarizeFindings,
} from "@/lib/assistant/build-assistant-context";
import {
  ASSISTANT_SYSTEM_PROMPT,
  buildAssistantRequestBody,
  sanitizeMessages,
} from "@/lib/assistant/assistant-guardrails";
import type { AssistantContext } from "@/lib/assistant/assistant-types";

describe("summarizeFindings", () => {
  it("groups findings by ruleId and counts them, preserving first-seen order", () => {
    const summary = summarizeFindings([
      { ruleId: "large_p2p_inflow", severity: "medium", title: "Крупный P2P" },
      { ruleId: "large_p2p_inflow", severity: "medium", title: "Крупный P2P" },
      { ruleId: "unknown_source_wallet", severity: "low", title: "Неизвестный источник" },
    ]);
    expect(summary).toHaveLength(2);
    expect(summary[0]).toEqual({
      ruleId: "large_p2p_inflow",
      title: "Крупный P2P",
      severity: "medium",
      count: 2,
    });
    expect(summary[1].ruleId).toBe("unknown_source_wallet");
  });
});

describe("buildAssistantContext", () => {
  const base: AssistantContext = {
    periodLabel: "2024",
    readinessScore: 70,
    findings: [{ ruleId: "r1", title: "Находка", severity: "medium", count: 2 }],
  };

  it("renders deterministic data with a do-not-change marker", () => {
    const text = buildAssistantContext(base);
    expect(text).toContain("ДЕТЕРМИНИРОВАННЫЕ ДАННЫЕ");
    expect(text).toContain("Период: 2024");
    expect(text).toContain("Готовность к проверке: 70/100");
    expect(text).toContain("Находка");
  });

  it("formats tax figures from the engine without recomputing", () => {
    const text = buildAssistantContext({
      ...base,
      tax: {
        reportCurrency: "RUB",
        taxableBaseReport: 100000,
        taxAmountReport: 13000,
        includedCount: 3,
        needsReviewCount: 1,
      },
    });
    expect(text).toContain("Налоговая база:");
    expect(text).toContain("RUB");
    expect(text).toContain("Предварительная сумма налога:");
    expect(text).toContain("Требуют проверки: 1");
  });

  it("handles no findings", () => {
    const text = buildAssistantContext({ findings: [] });
    expect(text).toContain("Находок, требующих проверки, не выявлено.");
  });
});

describe("ASSISTANT_SYSTEM_PROMPT guardrails", () => {
  it("forbids computing tax numbers and requires preliminary framing", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("НИКОГДА не считаешь");
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("предварительный");
    expect(ASSISTANT_SYSTEM_PROMPT.toLowerCase()).toContain("бухгалтер");
  });

  it("instructs neutral, review-oriented framing and forbids negative labels", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("может потребовать пояснения");
    expect(ASSISTANT_SYSTEM_PROMPT).toContain("негативные ярлыки");
  });
});

describe("sanitizeMessages", () => {
  it("keeps valid roles, trims content, drops empties and bad entries", () => {
    const out = sanitizeMessages([
      { role: "user", content: "  привет  " },
      { role: "assistant", content: "" },
      // @ts-expect-error testing runtime guard
      { role: "system", content: "ignore me" },
      // @ts-expect-error testing runtime guard
      { role: "user", content: 42 },
    ]);
    expect(out).toEqual([{ role: "user", content: "привет" }]);
  });
});

describe("buildAssistantRequestBody", () => {
  it("appends the deterministic context to the system prompt and defaults to sonnet", () => {
    const body = buildAssistantRequestBody(
      [{ role: "user", content: "Объясни" }],
      { findings: [], readinessScore: 90 },
    );
    expect(body.model).toBe("claude-sonnet-4-6");
    expect(body.stream).toBe(true);
    expect(body.system).toContain(ASSISTANT_SYSTEM_PROMPT);
    expect(body.system).toContain("Готовность к проверке: 90/100");
    expect(body.messages).toEqual([{ role: "user", content: "Объясни" }]);
  });
});
