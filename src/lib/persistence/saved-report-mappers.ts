import type {
  SavedReportDraft,
  SavedReportRecord,
  SavedReportSourceType,
} from "@/lib/persistence/saved-report-types";
import type { Database } from "@/lib/supabase/types";

export type SavedReportDatabaseRow =
  Database["public"]["Tables"]["saved_reports"]["Row"];

function mapReadinessLabel(value: string): SavedReportRecord["readinessLabel"] {
  if (value === "good" || value === "needs_review" || value === "high_risk") {
    return value;
  }

  return "needs_review";
}

function mapSourceType(value: string): SavedReportSourceType {
  return value === "local_upload" ? "local_upload" : "local_upload";
}

export function mapSavedReportRow(row: SavedReportDatabaseRow): SavedReportRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    fileName: row.file_name,
    readinessScore: row.readiness_score,
    readinessLabel: mapReadinessLabel(row.readiness_label),
    parserSummary: row.parser_summary as unknown as SavedReportDraft["parserSummary"],
    riskSummary: row.risk_summary as unknown as SavedReportDraft["riskSummary"],
    reportPreview: row.report_preview as unknown as SavedReportDraft["reportPreview"],
    partnerAttribution:
      row.partner_attribution as unknown as SavedReportDraft["partnerAttribution"],
    sourceType: mapSourceType(row.source_type),
  };
}
