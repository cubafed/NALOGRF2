export const reportFilesBucket = "crypto-audit-user-files";

export interface ReportFileRecord {
  id: string;
  userId: string;
  savedReportId: string | null;
  createdAt: string;
  storageBucket: string;
  storagePath: string;
  fileName: string;
  contentType: string | null;
  sizeBytes: number | null;
}

export type ReportFileValidationError =
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "INVALID_EXTENSION"
  | "INVALID_MIME_TYPE";

export type ReportFileValidationResult =
  | { ok: true }
  | { ok: false; error: ReportFileValidationError; message: string };

export type ReportFileUploadResult =
  | { ok: true; record: ReportFileRecord }
  | { ok: false; error: string };

export interface ReportFileUploadInput {
  savedReportId: string;
  file: File;
}

export interface ReportFileStorageService {
  uploadReportFile(input: ReportFileUploadInput): Promise<ReportFileUploadResult>;
  listReportFiles(savedReportId: string): Promise<ReportFileRecord[]>;
  deleteReportFile(record: ReportFileRecord): Promise<{ ok: boolean; error?: string }>;
}
