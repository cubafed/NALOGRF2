import { describe, expect, it } from "vitest";
import { createLocalReportFileStorageService } from "@/lib/storage/report-file-storage-service.local";
import { createSupabaseReportFileStorageService } from "@/lib/storage/report-file-storage-service.supabase";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";

const pdf = new File([new Uint8Array(1024)], "report.pdf", {
  type: "application/pdf",
});

const record: ReportFileRecord = {
  id: "file-1",
  userId: "user-1",
  savedReportId: "report-1",
  createdAt: "2026-06-05T00:00:00.000Z",
  storageBucket: "crypto-audit-user-files",
  storagePath: "user-1/reports/report-1/report.pdf",
  fileName: "report.pdf",
  contentType: "application/pdf",
  sizeBytes: 1024,
};

describe("report file storage services", () => {
  it("local service returns controlled unavailable state", async () => {
    const service = createLocalReportFileStorageService();

    await expect(
      service.uploadReportFile({ savedReportId: "report-1", file: pdf }),
    ).resolves.toMatchObject({
      ok: false,
    });
    await expect(service.listReportFiles("report-1")).resolves.toEqual([]);
    await expect(service.deleteReportFile(record)).resolves.toMatchObject({
      ok: false,
    });
  });

  it("Supabase service does not throw when client is unavailable", async () => {
    const service = createSupabaseReportFileStorageService(null);

    await expect(
      service.uploadReportFile({ savedReportId: "report-1", file: pdf }),
    ).resolves.toMatchObject({
      ok: false,
    });
    await expect(service.listReportFiles("report-1")).resolves.toEqual([]);
    await expect(service.deleteReportFile(record)).resolves.toMatchObject({
      ok: false,
    });
  });
});
