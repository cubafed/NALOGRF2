import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SavedReportDraft,
  SavedReportService,
  SaveReportResult,
} from "@/lib/persistence/saved-report-types";
import type { Database, Json } from "@/lib/supabase/types";
import { savedReportErrors } from "@/lib/persistence/saved-report-errors";
import { mapSavedReportRow } from "@/lib/persistence/saved-report-mappers";
import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export class SupabaseSavedReportService implements SavedReportService {
  constructor(private readonly client: SupabaseClient<Database> | null) {}

  async saveReport(draft: SavedReportDraft): Promise<SaveReportResult> {
    if (!this.client) {
      return { ok: false, error: savedReportErrors.supabaseUnavailable };
    }

    const userResult = await this.client.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      return { ok: false, error: savedReportErrors.authRequired };
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

    return { ok: true, record: mapSavedReportRow(insertResult.data) };
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

    return result.data.map(mapSavedReportRow);
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

    return mapSavedReportRow(result.data);
  }

  async deleteReport(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) {
      return { ok: false, error: savedReportErrors.supabaseUnavailable };
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
