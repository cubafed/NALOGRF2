import type { ImportSession } from "@/lib/client/import-session-storage";
import type { PartnerAttribution } from "@/lib/partners/partner-types";
import type { ReportPreviewModel } from "@/lib/report/report-types";
import type { ParserSummary } from "@/lib/parsers/parser-types";
import type { ReadinessLabel, RiskSummary } from "@/lib/risk/risk-types";

export type SavedReportSourceType = "local_upload";

export interface SavedReportDraft {
  title: string;
  fileName: string | null;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  parserSummary: ParserSummary;
  riskSummary: RiskSummary;
  reportPreview: ReportPreviewModel;
  partnerAttribution: PartnerAttribution | null;
  sourceType: SavedReportSourceType;
  documentCollectionState?: { collectedKeys: string[] };
}

export interface SavedReportRecord extends SavedReportDraft {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveReportResult =
  | { ok: true; record: SavedReportRecord }
  | { ok: false; error: string };

export interface SavedReportService {
  saveReport(draft: SavedReportDraft): Promise<SaveReportResult>;
  listReports(): Promise<SavedReportRecord[]>;
  getReport(id: string): Promise<SavedReportRecord | null>;
  deleteReport(id: string): Promise<{ ok: boolean; error?: string }>;
}

export interface SerializeReportSessionInput {
  session: ImportSession;
  report: ReportPreviewModel;
  partnerAttribution?: PartnerAttribution | null;
  collectedDocumentKeys?: string[];
}
