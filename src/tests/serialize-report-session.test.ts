import { describe, expect, it } from "vitest";
import type { ImportSession } from "@/lib/client/import-session-storage";
import type { PartnerAttribution } from "@/lib/partners/partner-types";
import { serializeReportSession } from "@/lib/persistence/serialize-report-session";
import type { ReportPreviewModel } from "@/lib/report/report-types";

const session: ImportSession = {
  version: 1,
  savedAt: "2026-06-05T00:00:00.000Z",
  fileName: "sample-universal.csv",
  parserSummary: {
    totalRows: 2,
    parsedRows: 1,
    warningRows: 0,
    errorRows: 1,
    transactionCount: 1,
    warningCount: 0,
    errorCount: 1,
  },
  transactions: [
    {
      id: "tx-1",
      date: "2024-01-01",
      type: "buy",
      asset: "BTC",
      amount: 0.1,
      price: 40000,
      fiatValue: 4000,
      fiatCurrency: "USD",
      fee: null,
      feeAsset: null,
      txHash: null,
      orderId: "RAW CSV CONTENT SHOULD NOT LEAK",
      counterparty: null,
      source: null,
      notes: null,
      rawRowNumber: 2,
    },
  ],
  parserWarnings: [],
  parserErrors: [],
  rawRows: [
    {
      rowNumber: 2,
      raw: { notes: "RAW CSV CONTENT SHOULD NOT LEAK" },
      normalized: { notes: "RAW CSV CONTENT SHOULD NOT LEAK" },
      status: "ok",
    },
  ],
  riskResult: {
    findings: [],
    summary: {
      totalFindings: 1,
      criticalCount: 0,
      mediumCount: 1,
      lowCount: 0,
      affectedTransactionCount: 1,
      rulesTriggered: ["missing_fiat_value"],
    },
    readinessScore: 64,
    readinessLabel: "needs_review",
  },
};

const report: ReportPreviewModel = {
  fileName: "sample-universal.csv",
  savedAt: "2026-06-05T00:00:00.000Z",
  readinessScore: 64,
  readinessLabel: "needs_review",
  parserSummary: session.parserSummary,
  riskSummary: session.riskResult.summary,
  findings: [],
  documentsNeeded: [],
  affectedRows: [],
  generatedQuestions: [],
  disclaimer: "Информационный отчет.",
};

const partnerAttribution: PartnerAttribution = {
  partner: "demo-exchange",
  ref: null,
  utmSource: "exchange-page",
  utmMedium: null,
  utmCampaign: "mvp-demo",
  utmContent: null,
  utmTerm: null,
  capturedAt: "2026-06-05T00:00:00.000Z",
  landingPath: "/upload",
};

describe("serializeReportSession", () => {
  it("creates SavedReportDraft from valid session and report model", () => {
    const draft = serializeReportSession({ session, report });

    expect(draft.title).toBe("Crypto Audit Report: sample-universal.csv");
    expect(draft.fileName).toBe("sample-universal.csv");
    expect(draft.sourceType).toBe("local_upload");
  });

  it("does not include raw CSV content", () => {
    const draft = serializeReportSession({ session, report });

    expect(JSON.stringify(draft)).not.toContain("RAW CSV CONTENT SHOULD NOT LEAK");
  });

  it("preserves report preview, readiness score and risk summary", () => {
    const draft = serializeReportSession({ session, report });

    expect(draft.readinessScore).toBe(64);
    expect(draft.riskSummary).toEqual(session.riskResult.summary);
    expect(draft.reportPreview).toEqual(report);
  });

  it("includes partner attribution if present", () => {
    const draft = serializeReportSession({
      session,
      report,
      partnerAttribution,
    });

    expect(draft.partnerAttribution).toEqual(partnerAttribution);
  });
});
