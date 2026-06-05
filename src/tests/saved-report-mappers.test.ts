import { describe, expect, it } from "vitest";
import { mapSavedReportRow } from "@/lib/persistence/saved-report-mappers";
import type { SavedReportDatabaseRow } from "@/lib/persistence/saved-report-mappers";

const baseRow: SavedReportDatabaseRow = {
  id: "report-1",
  user_id: "user-1",
  created_at: "2026-06-05T00:00:00.000Z",
  updated_at: "2026-06-05T00:00:00.000Z",
  title: "Crypto Audit Report: sample.csv",
  file_name: "sample.csv",
  readiness_score: 64,
  readiness_label: "needs_review",
  parser_summary: {
    totalRows: 1,
    parsedRows: 1,
    warningRows: 0,
    errorRows: 0,
    transactionCount: 1,
    warningCount: 0,
    errorCount: 0,
  },
  risk_summary: {
    totalFindings: 1,
    criticalCount: 0,
    mediumCount: 1,
    lowCount: 0,
    affectedTransactionCount: 1,
    rulesTriggered: ["missing_fiat_value"],
  },
  report_preview: {
    readinessScore: 64,
    readinessLabel: "needs_review",
  },
  partner_attribution: {
    partner: "demo-exchange",
    ref: null,
    utmSource: "exchange-page",
    utmMedium: null,
    utmCampaign: "mvp-demo",
    utmContent: null,
    utmTerm: null,
    capturedAt: "2026-06-05T00:00:00.000Z",
    landingPath: "/upload",
  },
  source_type: "local_upload",
};

describe("mapSavedReportRow", () => {
  it("converts database rows to SavedReportRecord", () => {
    const record = mapSavedReportRow(baseRow);

    expect(record.id).toBe("report-1");
    expect(record.userId).toBe("user-1");
    expect(record.fileName).toBe("sample.csv");
    expect(record.readinessScore).toBe(64);
    expect(record.readinessLabel).toBe("needs_review");
    expect(record.sourceType).toBe("local_upload");
    expect(record.partnerAttribution?.partner).toBe("demo-exchange");
  });

  it("handles missing optional fields safely", () => {
    const record = mapSavedReportRow({
      ...baseRow,
      file_name: null,
      partner_attribution: null,
      readiness_label: "unexpected",
      source_type: "unexpected",
    });

    expect(record.fileName).toBeNull();
    expect(record.partnerAttribution).toBeNull();
    expect(record.readinessLabel).toBe("needs_review");
    expect(record.sourceType).toBe("local_upload");
  });
});
