import { describe, expect, it } from "vitest";
import { validateReportFile } from "@/lib/storage/validate-report-file";

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateReportFile", () => {
  it("accepts valid PDF under max size", () => {
    expect(validateReportFile(makeFile("report.pdf", "application/pdf", 1024))).toEqual({
      ok: true,
    });
  });

  it("rejects non-PDF file", () => {
    expect(validateReportFile(makeFile("report.txt", "text/plain", 1024))).toMatchObject({
      ok: false,
      error: "INVALID_EXTENSION",
    });
  });

  it("rejects files above 10 MB", () => {
    expect(
      validateReportFile(makeFile("report.pdf", "application/pdf", 10 * 1024 * 1024 + 1)),
    ).toMatchObject({
      ok: false,
      error: "FILE_TOO_LARGE",
    });
  });

  it("rejects empty files", () => {
    expect(validateReportFile(makeFile("report.pdf", "application/pdf", 0))).toMatchObject({
      ok: false,
      error: "EMPTY_FILE",
    });
  });

  it("rejects invalid MIME type", () => {
    expect(validateReportFile(makeFile("report.pdf", "text/plain", 1024))).toMatchObject({
      ok: false,
      error: "INVALID_MIME_TYPE",
    });
  });
});
