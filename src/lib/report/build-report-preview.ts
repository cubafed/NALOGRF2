import type { ImportSession } from "@/lib/client/import-session-storage";
import { deriveReportQuestions } from "./derive-report-questions";
import { buildDocumentChecklist } from "./build-document-checklist";
import type { ReportPreviewModel } from "./report-types";

const REPORT_DISCLAIMER =
  "Информационный отчет. Не является налоговой, юридической, финансовой или AML-консультацией.";

/**
 * Transform an existing import/risk session into a structured report preview
 * model. This layer only summarizes findings, groups documents, and derives
 * review questions. It never re-runs or redefines risk rules — it reuses the
 * `riskResult` already computed during the upload flow. Output is deterministic.
 */
export function buildReportPreview(session: ImportSession): ReportPreviewModel {
  const { riskResult, parserSummary, fileName, savedAt } = session;
  const findings = riskResult.findings;

  // Aggregate, deduplicate and sort documents needed across all findings.
  const documentsNeeded = Array.from(
    new Set(findings.flatMap((f) => f.documentsNeeded)),
  ).sort((a, b) => a.localeCompare(b, "ru"));

  // Aggregate, deduplicate and sort affected raw row numbers across findings.
  const affectedRows = Array.from(
    new Set(findings.flatMap((f) => f.affectedRawRowNumbers)),
  ).sort((a, b) => a - b);

  const generatedQuestions = deriveReportQuestions(findings);
  const documentChecklist = buildDocumentChecklist(findings);

  return {
    fileName,
    savedAt,
    readinessScore: riskResult.readinessScore,
    readinessLabel: riskResult.readinessLabel,
    parserSummary,
    riskSummary: riskResult.summary,
    findings,
    documentsNeeded,
    affectedRows,
    generatedQuestions,
    documentChecklist,
    disclaimer: REPORT_DISCLAIMER,
  };
}
