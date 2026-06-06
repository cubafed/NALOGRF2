import type { ReadinessLabel, RiskSummary } from "@/lib/risk/risk-types";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getReadinessStatus } from "@/lib/ui/status-labels";

interface ReportSummaryProps {
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  riskSummary: RiskSummary;
}

export function ReportSummary({
  readinessScore,
  readinessLabel,
  riskSummary,
}: ReportSummaryProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Готовность отчета</p>
            <h2 style={{ margin: 0 }}>Сводка для проверки</h2>
          </div>
          <StatusBadge status={getReadinessStatus(readinessLabel)} />
        </div>
        <ProgressBar label={`Готовность: ${readinessScore}/100`} value={readinessScore} />

        <div className="metric-grid">
          <MetricCard label="Всего проблем" value={riskSummary.totalFindings} />
          <MetricCard label="Критичные" value={riskSummary.criticalCount} variant={riskSummary.criticalCount > 0 ? "danger" : "neutral"} />
          <MetricCard label="Средние" value={riskSummary.mediumCount} variant={riskSummary.mediumCount > 0 ? "warning" : "neutral"} />
          <MetricCard label="Низкие" value={riskSummary.lowCount} />
          <MetricCard label="Затронуто транзакций" value={riskSummary.affectedTransactionCount} />
        </div>
      </div>
    </section>
  );
}
