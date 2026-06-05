"use client";

import type { ReportFileStorageService } from "@/lib/storage/report-file-types";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";
import { ReportFileDeleteButton } from "@/components/storage/ReportFileDeleteButton";

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
      <p className="muted" style={{ marginBottom: 0 }}>
        PDF attachments пока не прикреплены.
      </p>
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
          <span>{file.contentType ?? "unknown"}</span>
          <span>{formatSize(file.sizeBytes)}</span>
          <time dateTime={file.createdAt}>
            {new Date(file.createdAt).toLocaleString("ru-RU")}
          </time>
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
