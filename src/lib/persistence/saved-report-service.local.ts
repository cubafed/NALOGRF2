import type {
  SavedReportDraft,
  SavedReportRecord,
  SavedReportService,
  SaveReportResult,
} from "@/lib/persistence/saved-report-types";
import { savedReportErrors } from "@/lib/persistence/saved-report-errors";

export class LocalSavedReportService implements SavedReportService {
  async saveReport(_draft: SavedReportDraft): Promise<SaveReportResult> {
    return { ok: false, error: savedReportErrors.localOnly };
  }

  async listReports(): Promise<SavedReportRecord[]> {
    return [];
  }

  async getReport(_id: string): Promise<SavedReportRecord | null> {
    return null;
  }

  async deleteReport(_id: string): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: savedReportErrors.localOnly };
  }
}

export function createLocalSavedReportService(): SavedReportService {
  return new LocalSavedReportService();
}
