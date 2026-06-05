import type {
  ReportFileRecord,
  ReportFileStorageService,
  ReportFileUploadInput,
  ReportFileUploadResult,
} from "@/lib/storage/report-file-types";

const unavailableMessage =
  "Supabase Storage не настроен. PDF attachments доступны только после входа и настройки Supabase.";

export class LocalReportFileStorageService implements ReportFileStorageService {
  async uploadReportFile(_input: ReportFileUploadInput): Promise<ReportFileUploadResult> {
    return { ok: false, error: unavailableMessage };
  }

  async listReportFiles(_savedReportId: string): Promise<ReportFileRecord[]> {
    return [];
  }

  async deleteReportFile(_record: ReportFileRecord): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: unavailableMessage };
  }
}

export function createLocalReportFileStorageService(): ReportFileStorageService {
  return new LocalReportFileStorageService();
}
