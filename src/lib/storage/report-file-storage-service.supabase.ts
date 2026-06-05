import type { SupabaseClient } from "@supabase/supabase-js";
import { buildReportStoragePath } from "@/lib/storage/build-report-storage-path";
import {
  mapReportFileRow,
  type ReportFileDatabaseRow,
} from "@/lib/storage/report-file-storage-service";
import {
  reportFilesBucket,
  type ReportFileRecord,
  type ReportFileStorageService,
  type ReportFileUploadInput,
  type ReportFileUploadResult,
} from "@/lib/storage/report-file-types";
import { validateReportFile } from "@/lib/storage/validate-report-file";
import type { Database } from "@/lib/supabase/types";

export class SupabaseReportFileStorageService implements ReportFileStorageService {
  constructor(private readonly client: SupabaseClient<Database> | null) {}

  async uploadReportFile({
    savedReportId,
    file,
  }: ReportFileUploadInput): Promise<ReportFileUploadResult> {
    if (!this.client) {
      return { ok: false, error: "Supabase Storage не настроен." };
    }

    const validation = validateReportFile(file);

    if (!validation.ok) {
      return { ok: false, error: validation.message };
    }

    const userResult = await this.client.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      return { ok: false, error: "Войдите в аккаунт, чтобы прикрепить PDF." };
    }

    const storagePath = buildReportStoragePath(user.id, savedReportId, file.name);
    const uploadResult = await this.client.storage
      .from(reportFilesBucket)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadResult.error) {
      return { ok: false, error: uploadResult.error.message };
    }

    const insertResult = await this.client
      .from("report_files")
      .insert({
        user_id: user.id,
        saved_report_id: savedReportId,
        storage_bucket: reportFilesBucket,
        storage_path: storagePath,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (insertResult.error) {
      await this.client.storage.from(reportFilesBucket).remove([storagePath]);
      return { ok: false, error: insertResult.error.message };
    }

    return {
      ok: true,
      record: mapReportFileRow(insertResult.data),
    };
  }

  async listReportFiles(savedReportId: string): Promise<ReportFileRecord[]> {
    if (!this.client) {
      return [];
    }

    const result = await this.client
      .from("report_files")
      .select()
      .eq("saved_report_id", savedReportId)
      .order("created_at", { ascending: false });

    if (result.error || !result.data) {
      return [];
    }

    return (result.data as ReportFileDatabaseRow[]).map(mapReportFileRow);
  }

  async deleteReportFile(record: ReportFileRecord): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) {
      return { ok: false, error: "Supabase Storage не настроен." };
    }

    const storageResult = await this.client.storage
      .from(record.storageBucket)
      .remove([record.storagePath]);

    if (storageResult.error) {
      return { ok: false, error: storageResult.error.message };
    }

    const deleteResult = await this.client
      .from("report_files")
      .delete()
      .eq("id", record.id);

    if (deleteResult.error) {
      return { ok: false, error: deleteResult.error.message };
    }

    return { ok: true };
  }
}

export function createSupabaseReportFileStorageService(
  client: SupabaseClient<Database> | null,
): ReportFileStorageService {
  return new SupabaseReportFileStorageService(client);
}
