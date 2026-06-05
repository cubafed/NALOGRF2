import type { RiskEngineResult } from "@/lib/risk/risk-types";
import type { ParserSummary } from "@/lib/parsers/parser-types";

interface ProblemsSummaryProps {
  riskResult: RiskEngineResult;
  parserSummary: ParserSummary;
  savedAt: string;
}

function readinessLabelRu(label: string): string {
  if (label === "good") return "Готов";
  if (label === "needs_review") return "Требует проверки";
  return "Высокий риск";
}

function readinessColor(label: string): string {
  if (label === "good") return "var(--green)";
  if (label === "needs_review") return "var(--amber)";
  return "var(--red)";
}

export function ProblemsSummary({ riskResult, parserSummary, savedAt }: ProblemsSummaryProps) {
  const { summary, readinessScore, readinessLabel } = riskResult;

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
            <strong>{summary.totalFindings}</strong>
          </div>
          <div className="metric">
            <span>Критичные</span>
            <strong style={{ color: summary.criticalCount > 0 ? "var(--red)" : undefined }}>
              {summary.criticalCount}
            </strong>
          </div>
          <div className="metric">
            <span>Средние</span>
            <strong style={{ color: summary.mediumCount > 0 ? "var(--amber)" : undefined }}>
              {summary.mediumCount}
            </strong>
          </div>
          <div className="metric">
            <span>Низкие</span>
            <strong>{summary.lowCount}</strong>
          </div>
          <div className="metric">
            <span>Затронуто транзакций</span>
            <strong>{summary.affectedTransactionCount}</strong>
          </div>
          <div className="metric">
            <span>Ошибки парсера</span>
            <strong style={{ color: parserSummary.errorCount > 0 ? "var(--red)" : undefined }}>
              {parserSummary.errorCount}
            </strong>
          </div>
          <div className="metric">
            <span>Предупреждения парсера</span>
            <strong style={{ color: parserSummary.warningCount > 0 ? "var(--amber)" : undefined }}>
              {parserSummary.warningCount}
            </strong>
          </div>
          <div className="metric">
            <span>Данные загружены</span>
            <strong style={{ fontSize: "12px" }}>
              {new Date(savedAt).toLocaleString("ru-RU")}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
