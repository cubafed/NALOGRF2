import type { ReportFileValidationResult } from "@/lib/storage/report-file-types";

const maxReportFileSizeBytes = 10 * 1024 * 1024;

export function validateReportFile(file: File): ReportFileValidationResult {
  if (file.size === 0) {
    return {
      ok: false,
      error: "EMPTY_FILE",
      message: "Файл пустой. Выберите PDF с содержимым.",
    };
  }

  if (file.size > maxReportFileSizeBytes) {
    return {
      ok: false,
      error: "FILE_TOO_LARGE",
      message: "PDF больше 10 MB. Выберите меньший файл.",
    };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      ok: false,
      error: "INVALID_EXTENSION",
      message: "В этом PR можно прикрепить только PDF-файл.",
    };
  }

  if (file.type !== "application/pdf") {
    return {
      ok: false,
      error: "INVALID_MIME_TYPE",
      message: "Тип файла должен быть application/pdf.",
    };
  }

  return { ok: true };
}
