import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SavedReportDraft,
  SavedReportRecord,
  SavedReportService,
  SaveReportResult,
} from "@/lib/persistence/saved-report-types";
import type { Database, Json } from "@/lib/supabase/types";

type SavedReportRow = Database["public"]["Tables"]["saved_reports"]["Row"];

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function mapRow(row: SavedReportRow): SavedReportRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    fileName: row.file_name,
    readinessScore: row.readiness_score,
    readinessLabel:
      row.readiness_label === "good" ||
      row.readiness_label === "needs_review" ||
      row.readiness_label === "high_risk"
        ? row.readiness_label
        : "needs_review",
    parserSummary: row.parser_summary as unknown as SavedReportDraft["parserSummary"],
    riskSummary: row.risk_summary as unknown as SavedReportDraft["riskSummary"],
    reportPreview: row.report_preview as unknown as SavedReportDraft["reportPreview"],
    partnerAttribution:
      row.partner_attribution as unknown as SavedReportDraft["partnerAttribution"],
    sourceType: "local_upload",
  };
}

export class SupabaseSavedReportService implements SavedReportService {
  constructor(private readonly client: SupabaseClient<Database> | null) {}

  async saveReport(draft: SavedReportDraft): Promise<SaveReportResult> {
    if (!this.client) {
      return { ok: false, error: "Supabase не настроен." };
    }

    const userResult = await this.client.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      return { ok: false, error: "Войдите в аккаунт, чтобы сохранить отчет." };
    }

    const insertResult = await this.client
      .from("saved_reports")
      .insert({
        user_id: user.id,
        title: draft.title,
        file_name: draft.fileName,
        readiness_score: draft.readinessScore,
        readiness_label: draft.readinessLabel,
        parser_summary: toJson(draft.parserSummary),
        risk_summary: toJson(draft.riskSummary),
        report_preview: toJson(draft.reportPreview),
        partner_attribution: draft.partnerAttribution
          ? toJson(draft.partnerAttribution)
          : null,
        source_type: draft.sourceType,
      })
      .select()
      .single();

    if (insertResult.error) {
      return { ok: false, error: insertResult.error.message };
    }

    return { ok: true, record: mapRow(insertResult.data) };
  }

  async listReports(): Promise<SavedReportRecord[]> {
    if (!this.client) {
      return [];
    }

    const result = await this.client
      .from("saved_reports")
      .select()
      .order("created_at", { ascending: false });

    if (result.error || !result.data) {
      return [];
    }

    return result.data.map(mapRow);
  }

  async getReport(id: string): Promise<SavedReportRecord | null> {
    if (!this.client) {
      return null;
    }

    const result = await this.client
      .from("saved_reports")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (result.error || !result.data) {
      return null;
    }

    return mapRow(result.data);
  }

  async deleteReport(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) {
      return { ok: false, error: "Supabase не настроен." };
    }

    const result = await this.client.from("saved_reports").delete().eq("id", id);

    if (result.error) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true };
  }
}

export function createSupabaseSavedReportService(
  client: SupabaseClient<Database> | null,
): SavedReportService {
  return new SupabaseSavedReportService(client);
}
