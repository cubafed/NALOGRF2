import { describe, it, expect } from "vitest";
import { deriveReportQuestions } from "@/lib/report/derive-report-questions";
import type { RiskFinding } from "@/lib/risk/risk-types";

function makeFinding(overrides: Partial<RiskFinding> = {}): RiskFinding {
  return {
    id: "f1",
    ruleId: "missing_fiat_value",
    severity: "medium",
    title: "Не указана fiat-стоимость операции",
    explanation: "В части операций отсутствует fiat-стоимость.",
    whyItMatters: "Бухгалтеру может понадобиться стоимость операции.",
    recommendedAction: "Добавьте fiat-стоимость операции.",
    documentsNeeded: ["exchange trade history", "price source"],
    affectedTransactionIds: ["tx-1", "tx-2"],
    affectedRawRowNumbers: [8, 9],
    status: "open",
    createdBy: "risk_engine_v1",
    ...overrides,
  };
}

describe("deriveReportQuestions", () => {
  it("returns no questions for empty findings", () => {
    expect(deriveReportQuestions([])).toEqual([]);
  });

  it("derives questions from finding fields with stable ids", () => {
    const finding = makeFinding();
    const questions = deriveReportQuestions([finding]);

    // documents (1) + rows (1) + verify (1) + missing-data (1) = 4
    expect(questions).toHaveLength(4);
    expect(questions.map((q) => q.id)).toEqual([
      "f1-q0",
      "f1-q1",
      "f1-q2",
      "f1-q3",
    ]);
    expect(questions[0].question).toContain(finding.title);
    expect(questions[1].question).toContain("8, 9");
    expect(questions.every((q) => q.findingId === "f1")).toBe(true);
    expect(questions.every((q) => q.ruleId === "missing_fiat_value")).toBe(true);
  });

  it("is deterministic — identical input yields identical output", () => {
    const a = deriveReportQuestions([makeFinding()]);
    const b = deriveReportQuestions([makeFinding()]);
    expect(a).toEqual(b);
  });

  it("skips document question when no documents are listed", () => {
    const questions = deriveReportQuestions([makeFinding({ documentsNeeded: [] })]);
    // rows (1) + verify (1) + missing-data (1) = 3
    expect(questions).toHaveLength(3);
    expect(questions.some((q) => q.question.startsWith("Какими документами"))).toBe(false);
  });

  it("skips rows question when no affected rows are listed", () => {
    const questions = deriveReportQuestions([makeFinding({ affectedRawRowNumbers: [] })]);
    // documents (1) + verify (1) + missing-data (1) = 3
    expect(questions).toHaveLength(3);
    expect(questions.some((q) => q.question.startsWith("Какие пояснения нужны по строкам"))).toBe(
      false,
    );
  });

  it("does not mutate the findings", () => {
    const finding = makeFinding();
    const docsRef = finding.documentsNeeded;
    const rowsRef = finding.affectedRawRowNumbers;
    deriveReportQuestions([finding]);
    expect(finding.documentsNeeded).toBe(docsRef);
    expect(finding.affectedRawRowNumbers).toBe(rowsRef);
    expect(finding.documentsNeeded).toEqual(["exchange trade history", "price source"]);
    // copies on the question must not share references with the finding arrays
    const questions = deriveReportQuestions([finding]);
    expect(questions[0].documentsNeeded).not.toBe(finding.documentsNeeded);
    expect(questions[0].affectedRawRowNumbers).not.toBe(finding.affectedRawRowNumbers);
  });
});
