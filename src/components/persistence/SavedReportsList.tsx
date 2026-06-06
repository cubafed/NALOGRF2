import Link from "next/link";
import { ActionLink } from "@/components/ui/ActionLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/ui/formatters";
import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";

interface SavedReportsListProps {
  reports: SavedReportRecord[];
}

export function SavedReportsList({ reports }: SavedReportsListProps) {
  if (reports.length === 0) {
    return (
      <EmptyState
        description="Сохраненных отчетов пока нет. Сохранение выполняется только после явного действия пользователя на странице отчета."
        primaryAction={<ActionLink href="/upload" variant="primary">Перейти к импорту</ActionLink>}
        secondaryAction={<ActionLink href="/report" variant="ghost">Открыть отчет</ActionLink>}
        title="Пока нет сохраненных отчетов"
      />
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
          <StatusBadge status={report.readinessLabel === "good" ? "ready" : report.readinessLabel === "needs_review" ? "needs_review" : "error"} />
          <span>{report.sourceType}</span>
          <time dateTime={report.createdAt}>
            {formatDateShort(report.createdAt)}
          </time>
        </Link>
      ))}
    </div>
  );
}
