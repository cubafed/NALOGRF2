import type {
  SavedReportDraft,
  SavedReportRecord,
  SavedReportService,
  SaveReportResult,
} from "@/lib/persistence/saved-report-types";

const localOnlyMessage =
  "Облачное сохранение не настроено. Сейчас отчет доступен только в локальном браузерном сеансе.";

export class LocalSavedReportService implements SavedReportService {
  async saveReport(_draft: SavedReportDraft): Promise<SaveReportResult> {
    return { ok: false, error: localOnlyMessage };
  }

  async listReports(): Promise<SavedReportRecord[]> {
    return [];
  }

  async getReport(_id: string): Promise<SavedReportRecord | null> {
    return null;
  }

  async deleteReport(_id: string): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: localOnlyMessage };
  }
}

export function createLocalSavedReportService(): SavedReportService {
  return new LocalSavedReportService();
}
