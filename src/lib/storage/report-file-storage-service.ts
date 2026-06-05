import type { Database } from "@/lib/supabase/types";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";

export type ReportFileDatabaseRow =
  Database["public"]["Tables"]["report_files"]["Row"];

export function mapReportFileRow(row: ReportFileDatabaseRow): ReportFileRecord {
  return {
    id: row.id,
    userId: row.user_id,
    savedReportId: row.saved_report_id,
    createdAt: row.created_at,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
  };
}
