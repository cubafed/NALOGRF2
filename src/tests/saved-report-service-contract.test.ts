import { describe, expect, it } from "vitest";
import { savedReportErrors } from "@/lib/persistence/saved-report-errors";
import { createLocalSavedReportService } from "@/lib/persistence/saved-report-service.local";
import type { SavedReportDraft } from "@/lib/persistence/saved-report-types";

const draft: SavedReportDraft = {
  title: "Crypto Audit Report: sample.csv",
  fileName: "sample.csv",
  readinessScore: 64,
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
    totalFindings: 1,
    criticalCount: 0,
    mediumCount: 1,
    lowCount: 0,
    affectedTransactionCount: 1,
    rulesTriggered: ["missing_fiat_value"],
  },
  reportPreview: {
    fileName: "sample.csv",
    savedAt: "2026-06-05T00:00:00.000Z",
    readinessScore: 64,
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
      totalFindings: 1,
      criticalCount: 0,
      mediumCount: 1,
      lowCount: 0,
      affectedTransactionCount: 1,
      rulesTriggered: ["missing_fiat_value"],
    },
    findings: [],
    documentsNeeded: [],
    affectedRows: [],
    generatedQuestions: [],
    disclaimer: "Информационный отчет.",
  },
  partnerAttribution: null,
  sourceType: "local_upload",
};

describe("local saved report service contract", () => {
  it("returns controlled unavailable result for saveReport", async () => {
    const service = createLocalSavedReportService();

    await expect(service.saveReport(draft)).resolves.toEqual({
      ok: false,
      error: savedReportErrors.localOnly,
    });
  });

  it("returns empty/no-op results without throwing", async () => {
    const service = createLocalSavedReportService();

    await expect(service.listReports()).resolves.toEqual([]);
    await expect(service.getReport("missing")).resolves.toBeNull();
    await expect(service.deleteReport("missing")).resolves.toEqual({
      ok: false,
      error: savedReportErrors.localOnly,
    });
  });
});
