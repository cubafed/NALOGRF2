function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/\.+/g, ".")
    .replace(/^-+|-+$/g, "");
}

function sanitizePdfFileName(fileName: string): string {
  const withoutPath = fileName.split(/[/\\]+/).pop() ?? "";
  const withoutExtension = withoutPath.replace(/\.pdf$/i, "");
  const safeBaseName = sanitizePathSegment(withoutExtension).replace(/\./g, "-");

  return `${safeBaseName || "report"}.pdf`;
}

export function buildReportStoragePath(
  userId: string,
  savedReportId: string,
  fileName: string,
): string {
  const safeUserId = sanitizePathSegment(userId);
  const safeReportId = sanitizePathSegment(savedReportId);

  if (!safeUserId) {
    throw new Error("Missing userId for report file storage path.");
  }

  if (!safeReportId) {
    throw new Error("Missing savedReportId for report file storage path.");
  }

  return `${safeUserId}/reports/${safeReportId}/${sanitizePdfFileName(fileName)}`;
}
