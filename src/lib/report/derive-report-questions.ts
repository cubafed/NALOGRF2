import type { RiskFinding } from "@/lib/risk/risk-types";
import type { ReportQuestion } from "./report-types";

/**
 * Deterministically derive review questions from existing risk findings.
 *
 * The report layer only summarizes and rephrases information already present
 * on each finding. It does not re-run or redefine risk rules, does not mutate
 * findings, and produces stable IDs (no UUIDs, no randomness). Wording is
 * neutral: it asks what to clarify or confirm, never makes legal, tax, or
 * AML conclusions.
 */
export function deriveReportQuestions(findings: readonly RiskFinding[]): ReportQuestion[] {
  const questions: ReportQuestion[] = [];

  for (const finding of findings) {
    const base = {
      findingId: finding.id,
      ruleId: finding.ruleId,
      whyItMatters: finding.whyItMatters,
      affectedRawRowNumbers: [...finding.affectedRawRowNumbers],
      documentsNeeded: [...finding.documentsNeeded],
    };

    let index = 0;
    const push = (question: string) => {
      questions.push({
        id: `${finding.id}-q${index}`,
        question,
        ...base,
      });
      index += 1;
    };

    // 1. Documents needed to support this finding (only if documents listed).
    if (finding.documentsNeeded.length > 0) {
      push(`Какими документами подтвердить: ${finding.title}?`);
    }

    // 2. Explanations needed for the affected rows (only if rows listed).
    if (finding.affectedRawRowNumbers.length > 0) {
      push(
        `Какие пояснения нужны по строкам: ${finding.affectedRawRowNumbers.join(", ")}?`,
      );
    }

    // 3. What to verify before handing the report to an accountant.
    push(
      `Что нужно проверить перед передачей отчета бухгалтеру по проблеме: ${finding.title}?`,
    );

    // 4. Which data is missing or needs clarification (from explanation).
    push(`Какие данные отсутствуют или требуют уточнения: ${finding.explanation}`);
  }

  return questions;
}
