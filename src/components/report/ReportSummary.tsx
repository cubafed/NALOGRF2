import type { ReadinessLabel, RiskSummary } from "@/lib/risk/risk-types";

interface ReportSummaryProps {
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  riskSummary: RiskSummary;
}

function readinessLabelRu(label: ReadinessLabel): string {
  if (label === "good") return "Готов";
  if (label === "needs_review") return "Требует проверки";
  return "Высокий риск";
}

function readinessColor(label: ReadinessLabel): string {
  if (label === "good") return "var(--green)";
  if (label === "needs_review") return "var(--amber)";
  return "var(--red)";
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
            <h2 style={{ margin: 0 }}>
              <span style={{ color: readinessColor(readinessLabel) }}>
                {readinessLabelRu(readinessLabel)}
              </span>
            </h2>
          </div>
          <span className="badge" style={{ fontSize: "22px", padding: "8px 18px" }}>
            {readinessScore}
            <span style={{ fontSize: "13px", opacity: 0.6 }}>/100</span>
          </span>
        </div>

        <div className="metric-grid">
          <div className="metric">
            <span>Всего проблем</span>
            <strong>{riskSummary.totalFindings}</strong>
          </div>
          <div className="metric">
            <span>Критичные</span>
            <strong style={{ color: riskSummary.criticalCount > 0 ? "var(--red)" : undefined }}>
              {riskSummary.criticalCount}
            </strong>
          </div>
          <div className="metric">
            <span>Средние</span>
            <strong style={{ color: riskSummary.mediumCount > 0 ? "var(--amber)" : undefined }}>
              {riskSummary.mediumCount}
            </strong>
          </div>
          <div className="metric">
            <span>Низкие</span>
            <strong>{riskSummary.lowCount}</strong>
          </div>
          <div className="metric">
            <span>Затронуто транзакций</span>
            <strong>{riskSummary.affectedTransactionCount}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
