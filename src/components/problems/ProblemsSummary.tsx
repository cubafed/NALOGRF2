import type { RiskEngineResult } from "@/lib/risk/risk-types";
import type { ParserSummary } from "@/lib/parsers/parser-types";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/ui/formatters";
import { getReadinessStatus } from "@/lib/ui/status-labels";

interface ProblemsSummaryProps {
  riskResult: RiskEngineResult;
  parserSummary: ParserSummary;
  savedAt: string;
}

export function ProblemsSummary({ riskResult, parserSummary, savedAt }: ProblemsSummaryProps) {
  const { summary, readinessScore, readinessLabel } = riskResult;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Готовность отчета</p>
            <h2 style={{ margin: 0 }}>Состояние локального импорта</h2>
          </div>
          <StatusBadge status={getReadinessStatus(readinessLabel)} />
        </div>
        <ProgressBar label={`Готовность: ${readinessScore}/100`} value={readinessScore} />

        <div className="metric-grid">
          <MetricCard label="Всего проблем" value={summary.totalFindings} />
          <MetricCard label="Критичные" value={summary.criticalCount} variant={summary.criticalCount > 0 ? "danger" : "neutral"} />
          <MetricCard label="Средние" value={summary.mediumCount} variant={summary.mediumCount > 0 ? "warning" : "neutral"} />
          <MetricCard label="Низкие" value={summary.lowCount} />
          <MetricCard label="Затронуто транзакций" value={summary.affectedTransactionCount} />
          <MetricCard label="Ошибки импорта" value={parserSummary.errorCount} variant={parserSummary.errorCount > 0 ? "danger" : "neutral"} />
          <MetricCard label="Предупреждения импорта" value={parserSummary.warningCount} variant={parserSummary.warningCount > 0 ? "warning" : "neutral"} />
          <MetricCard label="Данные загружены" value={formatDateShort(savedAt)} />
        </div>
      </div>
    </section>
  );
}
