import { describe, expect, it } from "vitest";
import { buildReportExportFilename } from "@/lib/report/build-report-export-filename";
import type { ReportPreviewModel } from "@/lib/report/report-types";

const baseReport: ReportPreviewModel = {
  fileName: "sample-universal.csv",
  savedAt: "2026-06-05T09:30:00.000Z",
  readinessScore: 72,
  readinessLabel: "needs_review",
  parserSummary: {
    totalRows: 1,
    parsedRows: 1,
    warningRows: 0,
    errorRows: 0,
    transactionCount: 1,
    warningCount: 0,
    errorCount: 0,
  },
  riskSummary: {
    totalFindings: 0,
    criticalCount: 0,
    mediumCount: 0,
    lowCount: 0,
    affectedTransactionCount: 0,
    rulesTriggered: [],
  },
  findings: [],
  documentsNeeded: [],
  affectedRows: [],
  generatedQuestions: [],
  disclaimer: "Информационный отчет.",
};

describe("buildReportExportFilename", () => {
  it("uses source file name and saved date", () => {
    expect(buildReportExportFilename(baseReport)).toBe(
      "crypto-audit-report-sample-universal-2026-06-05.pdf",
    );
  });

  it("sanitizes unsafe characters", () => {
    expect(
      buildReportExportFilename({
        ...baseReport,
        fileName: "My Report (RU) $$$.CSV",
      }),
    ).toBe("crypto-audit-report-my-report-ru-2026-06-05.pdf");
  });

  it("falls back when source file name is missing", () => {
    expect(
      buildReportExportFilename({
        ...baseReport,
        fileName: null,
      }),
    ).toBe("crypto-audit-report.pdf");
  });
});
