import { describe, it, expect } from "vitest";
import { buildDocumentChecklist } from "@/lib/report/build-document-checklist";
import type { RiskFinding } from "@/lib/risk/risk-types";

function makeFinding(overrides: Partial<RiskFinding> = {}): RiskFinding {
  return {
    id: "f1",
    ruleId: "missing_fiat_value",
    severity: "medium",
    title: "Test finding",
    explanation: "Explanation",
    whyItMatters: "Why",
    recommendedAction: "Action",
    documentsNeeded: ["bank statement"],
    affectedTransactionIds: ["tx-1"],
    affectedRawRowNumbers: [3],
    status: "open",
    createdBy: "risk_engine_v1",
    ...overrides,
  };
}

describe("buildDocumentChecklist", () => {
  it("returns empty array for no findings", () => {
    expect(buildDocumentChecklist([])).toEqual([]);
  });

  it("deduplicates the same document token across findings", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["bank statement"] }),
      makeFinding({ id: "f2", documentsNeeded: ["bank statement"] }),
    ];
    const items = buildDocumentChecklist(findings);
    const bankItems = items.filter((i) => i.key === "bank_statement");
    expect(bankItems).toHaveLength(1);
  });

  it("merges requiredByFindingIds from multiple findings", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["bank statement"] }),
      makeFinding({ id: "f2", documentsNeeded: ["bank statement"] }),
    ];
    const items = buildDocumentChecklist(findings);
    const item = items.find((i) => i.key === "bank_statement");
    expect(item?.requiredByFindingIds).toContain("f1");
    expect(item?.requiredByFindingIds).toContain("f2");
  });

  it("merges and sorts affectedRawRowNumbers across findings", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["bank statement"], affectedRawRowNumbers: [8, 3] }),
      makeFinding({ id: "f2", documentsNeeded: ["bank statement"], affectedRawRowNumbers: [3, 15] }),
    ];
    const items = buildDocumentChecklist(findings);
    const item = items.find((i) => i.key === "bank_statement");
    expect(item?.affectedRawRowNumbers).toEqual([3, 8, 15]);
  });

  it("sets priority to max severity of referencing findings", () => {
    const findings = [
      makeFinding({ id: "f1", severity: "low", documentsNeeded: ["bank statement"] }),
      makeFinding({ id: "f2", severity: "critical", documentsNeeded: ["bank statement"] }),
    ];
    const items = buildDocumentChecklist(findings);
    const item = items.find((i) => i.key === "bank_statement");
    expect(item?.priority).toBe("critical");
  });

  it("sorts items: critical before medium before low", () => {
    const findings = [
      makeFinding({ id: "f1", severity: "low", documentsNeeded: ["source row"] }),
      makeFinding({ id: "f2", severity: "critical", documentsNeeded: ["acquisition record"] }),
      makeFinding({ id: "f3", severity: "medium", documentsNeeded: ["bank statement"] }),
    ];
    const items = buildDocumentChecklist(findings);
    const priorities = items.map((i) => i.priority);
    const order = { critical: 0, medium: 1, low: 2 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i]]).toBeGreaterThanOrEqual(order[priorities[i - 1]]);
    }
  });

  it("is deterministic: same input produces same output", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["bank statement", "price source"] }),
      makeFinding({ id: "f2", severity: "critical", documentsNeeded: ["bank statement", "acquisition record"] }),
    ];
    const a = buildDocumentChecklist(findings);
    const b = buildDocumentChecklist(findings);
    expect(a).toEqual(b);
  });

  it("preserves rawTokens for audit trail", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["bank statement"] }),
    ];
    const items = buildDocumentChecklist(findings);
    const item = items.find((i) => i.key === "bank_statement");
    expect(item?.rawTokens).toContain("bank statement");
  });

  it("does not lose unknown tokens — falls back to other category", () => {
    const findings = [
      makeFinding({ id: "f1", documentsNeeded: ["very obscure custom doc"] }),
    ];
    const items = buildDocumentChecklist(findings);
    expect(items).toHaveLength(1);
    expect(items[0].category).toBe("other");
    expect(items[0].rawTokens).toContain("very obscure custom doc");
  });
});
