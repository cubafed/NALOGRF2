import { describe, it, expect } from "vitest";
import { buildReportPreview } from "@/lib/report/build-report-preview";
import type { ImportSession } from "@/lib/client/import-session-storage";
import type { RiskEngineResult, RiskFinding } from "@/lib/risk/risk-types";
import type { ParserSummary } from "@/lib/parsers/parser-types";

const parserSummary: ParserSummary = {
  totalRows: 10,
  parsedRows: 9,
  warningRows: 1,
  errorRows: 1,
  transactionCount: 9,
  warningCount: 1,
  errorCount: 1,
};

function makeFinding(overrides: Partial<RiskFinding> = {}): RiskFinding {
  return {
    id: "f1",
    ruleId: "missing_fiat_value",
    severity: "medium",
    title: "Не указана fiat-стоимость операции",
    explanation: "В части операций отсутствует fiat-стоимость.",
    whyItMatters: "Бухгалтеру может понадобиться стоимость операции.",
    recommendedAction: "Добавьте fiat-стоимость операции.",
    documentsNeeded: ["price source", "exchange trade history"],
    affectedTransactionIds: ["tx-1"],
    affectedRawRowNumbers: [8, 5],
    status: "open",
    createdBy: "risk_engine_v1",
    ...overrides,
  };
}

function makeSession(findings: RiskFinding[]): ImportSession {
  const riskResult: RiskEngineResult = {
    findings,
    summary: {
      totalFindings: findings.length,
      criticalCount: findings.filter((f) => f.severity === "critical").length,
      mediumCount: findings.filter((f) => f.severity === "medium").length,
      lowCount: findings.filter((f) => f.severity === "low").length,
      affectedTransactionCount: 1,
      rulesTriggered: findings.map((f) => f.ruleId),
    },
    readinessScore: 67,
    readinessLabel: "needs_review",
  };
  return {
    version: 1,
    savedAt: "2026-01-01T00:00:00.000Z",
    fileName: "sample.csv",
    parserSummary,
    transactions: [],
    parserWarnings: [],
    parserErrors: [],
    rawRows: [],
    riskResult,
  };
}

describe("buildReportPreview", () => {
  it("maps session fields into the report model", () => {
    const model = buildReportPreview(makeSession([makeFinding()]));
    expect(model.fileName).toBe("sample.csv");
    expect(model.savedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(model.readinessScore).toBe(67);
    expect(model.readinessLabel).toBe("needs_review");
    expect(model.parserSummary).toBe(parserSummary);
    expect(model.riskSummary.totalFindings).toBe(1);
    expect(model.disclaimer).toContain("Не является налоговой");
  });

  it("aggregates, deduplicates and sorts documents across findings", () => {
    const model = buildReportPreview(
      makeSession([
        makeFinding({ id: "a", documentsNeeded: ["bank statement", "price source"] }),
        makeFinding({ id: "b", documentsNeeded: ["price source", "acquisition record"] }),
      ]),
    );
    expect(model.documentsNeeded).toEqual([
      "acquisition record",
      "bank statement",
      "price source",
    ]);
  });

  it("aggregates, deduplicates and sorts affected rows numerically", () => {
    const model = buildReportPreview(
      makeSession([
        makeFinding({ id: "a", affectedRawRowNumbers: [8, 5] }),
        makeFinding({ id: "b", affectedRawRowNumbers: [5, 2, 12] }),
      ]),
    );
    expect(model.affectedRows).toEqual([2, 5, 8, 12]);
  });

  it("generates deterministic questions from findings", () => {
    const session = makeSession([makeFinding()]);
    const a = buildReportPreview(session);
    const b = buildReportPreview(session);
    expect(a.generatedQuestions).toEqual(b.generatedQuestions);
    expect(a.generatedQuestions.length).toBeGreaterThan(0);
  });

  it("handles a session with no findings", () => {
    const model = buildReportPreview(makeSession([]));
    expect(model.findings).toEqual([]);
    expect(model.documentsNeeded).toEqual([]);
    expect(model.affectedRows).toEqual([]);
    expect(model.generatedQuestions).toEqual([]);
  });
});
