import type { ReportPreviewModel } from "@/lib/report/report-types";

const DEFAULT_EXPORT_FILENAME = "crypto-audit-report.pdf";

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

function slugifyFileName(fileName: string): string {
  return stripExtension(fileName)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSavedDate(savedAt: string): string | null {
  const timestamp = Date.parse(savedAt);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

export function buildReportExportFilename(report: ReportPreviewModel): string {
  if (!report.fileName) {
    return DEFAULT_EXPORT_FILENAME;
  }

  const sourceSlug = slugifyFileName(report.fileName);

  if (!sourceSlug) {
    return DEFAULT_EXPORT_FILENAME;
  }

  const savedDate = formatSavedDate(report.savedAt);
  const dateSuffix = savedDate ? `-${savedDate}` : "";

  return `crypto-audit-report-${sourceSlug}${dateSuffix}.pdf`;
}
