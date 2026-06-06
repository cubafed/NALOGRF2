import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";
import { DataPanel } from "@/components/ui/DataPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/ui/formatters";

interface SavedReportDetailProps {
  report: SavedReportRecord;
}

export function SavedReportDetail({ report }: SavedReportDetailProps) {
  return (
    <div className="upload-stack">
      <DataPanel
        actions={<StatusBadge label={report.sourceType} status="saved" />}
        eyebrow="Сохраненный отчет"
        title={report.title}
      >
          <div className="metric-grid">
            <MetricCard label="Готовность" value={`${report.readinessScore}/100`} />
            <MetricCard label="Статус" value={report.readinessLabel} />
            <MetricCard label="Файл" value={report.fileName ?? "Без имени файла"} />
            <MetricCard label="Сохранено" value={formatDateShort(report.createdAt)} />
          </div>
      </DataPanel>

      <DataPanel eyebrow="Метаданные" title="Сводка сохраненного отчета">
          <div className="metric-grid">
            <MetricCard label="Операции" value={report.parserSummary.transactionCount} />
            <MetricCard label="Всего проблем" value={report.riskSummary.totalFindings} />
            <MetricCard
              label="Критичные / средние / низкие"
              value={
                <>
                {report.riskSummary.criticalCount} / {report.riskSummary.mediumCount} /{" "}
                {report.riskSummary.lowCount}
                </>
              }
            />
            <MetricCard label="Partner tag" value={report.partnerAttribution?.partner ?? "Нет"} />
          </div>
          <NoticeCard compact variant="info">
            <p className="muted">
              Детальная страница показывает сохраненную запись без повторных расчетов.
              Информационный отчет не является налоговой, юридической, финансовой или
              AML-консультацией.
            </p>
          </NoticeCard>
      </DataPanel>
    </div>
  );
}
