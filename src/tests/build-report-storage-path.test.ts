import { describe, expect, it } from "vitest";
import { buildReportStoragePath } from "@/lib/storage/build-report-storage-path";

describe("buildReportStoragePath", () => {
  it("creates safe path using userId and savedReportId", () => {
    expect(
      buildReportStoragePath(
        "user-uuid",
        "report-uuid",
        "crypto-audit-report-2026-06-05.pdf",
      ),
    ).toBe("user-uuid/reports/report-uuid/crypto-audit-report-2026-06-05.pdf");
  });

  it("sanitizes unsafe file names", () => {
    expect(
      buildReportStoragePath(
        "User UUID",
        "Report UUID",
        "../Crypto Audit Report (Final) 2026.pdf",
      ),
    ).toBe("user-uuid/reports/report-uuid/crypto-audit-report-final-2026.pdf");
  });

  it("rejects missing userId or savedReportId", () => {
    expect(() => buildReportStoragePath("", "report-uuid", "report.pdf")).toThrow(
      "Missing userId",
    );
    expect(() => buildReportStoragePath("user-uuid", "", "report.pdf")).toThrow(
      "Missing savedReportId",
    );
  });
});
