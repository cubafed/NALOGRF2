"use client";

import type { ReportFileStorageService } from "@/lib/storage/report-file-types";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";
import { ReportFileDeleteButton } from "@/components/storage/ReportFileDeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateShort } from "@/lib/ui/formatters";

interface ReportFilesListProps {
  files: ReportFileRecord[];
  service: ReportFileStorageService;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
}

function formatSize(sizeBytes: number | null): string {
  if (sizeBytes === null) {
    return "Неизвестно";
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ReportFilesList({
  files,
  service,
  onDeleted,
  onError,
}: ReportFilesListProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        description="PDF-файлы пока не прикреплены. Загрузка выполняется только после явного выбора файла."
        title="Нет прикрепленных PDF"
      />
    );
  }

  return (
    <div className="report-file-list">
      {files.map((file) => (
        <div className="report-file-row" key={file.id}>
          <span>
            <strong>{file.fileName}</strong>
            <small>{file.storagePath}</small>
          </span>
          <span>{file.contentType ?? "Неизвестно"}</span>
          <span>{formatSize(file.sizeBytes)}</span>
          <time dateTime={file.createdAt}>{formatDateShort(file.createdAt)}</time>
          <ReportFileDeleteButton
            record={file}
            service={service}
            onDeleted={onDeleted}
            onError={onError}
          />
        </div>
      ))}
    </div>
  );
}
