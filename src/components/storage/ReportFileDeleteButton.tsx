"use client";

import { useState } from "react";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";
import type { ReportFileStorageService } from "@/lib/storage/report-file-types";

interface ReportFileDeleteButtonProps {
  record: ReportFileRecord;
  service: ReportFileStorageService;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
}

export function ReportFileDeleteButton({
  record,
  service,
  onDeleted,
  onError,
}: ReportFileDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await service.deleteReportFile(record);
    setIsDeleting(false);

    if (!result.ok) {
      onError(result.error ?? "Не удалось удалить PDF-файл.");
      return;
    }

    onDeleted(record.id);
  };

  return (
    <button type="button" className="btn" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? "Удаление..." : "Удалить"}
    </button>
  );
}
