import Link from "next/link";
import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";

interface SavedReportsListProps {
  reports: SavedReportRecord[];
}

export function SavedReportsList({ reports }: SavedReportsListProps) {
  if (reports.length === 0) {
    return (
      <p className="muted">
        Сохраненных отчетов пока нет. Сохранение выполняется только после явного
        действия пользователя на `/report`.
      </p>
    );
  }

  return (
    <div className="saved-report-list">
      {reports.map((report) => (
        <Link href={`/saved-reports/${report.id}`} className="saved-report-row" key={report.id}>
          <span className="score-pill">{report.readinessScore}/100</span>
          <span>
            <strong>{report.title}</strong>
            <small>{report.fileName ?? "Без имени файла"}</small>
          </span>
          <span>{report.readinessLabel}</span>
          <span>{report.sourceType}</span>
          <time dateTime={report.createdAt}>
            {new Date(report.createdAt).toLocaleString("ru-RU")}
          </time>
        </Link>
      ))}
    </div>
  );
}
