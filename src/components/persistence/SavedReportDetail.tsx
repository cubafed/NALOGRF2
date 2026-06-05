import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";

interface SavedReportDetailProps {
  report: SavedReportRecord;
}

export function SavedReportDetail({ report }: SavedReportDetailProps) {
  return (
    <div className="upload-stack">
      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Saved report</p>
              <h2 style={{ margin: 0 }}>{report.title}</h2>
            </div>
            <span className="badge">{report.sourceType}</span>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span>Readiness score</span>
              <strong>{report.readinessScore}/100</strong>
            </div>
            <div className="metric">
              <span>Readiness label</span>
              <strong>{report.readinessLabel}</strong>
            </div>
            <div className="metric">
              <span>Файл</span>
              <strong style={{ overflowWrap: "anywhere" }}>
                {report.fileName ?? "Без имени файла"}
              </strong>
            </div>
            <div className="metric">
              <span>Сохранено</span>
              <strong style={{ fontSize: "13px" }}>
                {new Date(report.createdAt).toLocaleString("ru-RU")}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Persisted metadata</p>
              <h2 style={{ margin: 0 }}>Сводка сохраненного отчета</h2>
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span>Transactions</span>
              <strong>{report.parserSummary.transactionCount}</strong>
            </div>
            <div className="metric">
              <span>Total findings</span>
              <strong>{report.riskSummary.totalFindings}</strong>
            </div>
            <div className="metric">
              <span>Critical / medium / low</span>
              <strong>
                {report.riskSummary.criticalCount} / {report.riskSummary.mediumCount} /{" "}
                {report.riskSummary.lowCount}
              </strong>
            </div>
            <div className="metric">
              <span>Partner tag</span>
              <strong>{report.partnerAttribution?.partner ?? "Нет"}</strong>
            </div>
          </div>
          <p className="muted" style={{ marginBottom: 0, marginTop: "16px" }}>
            Детальная страница показывает сохраненную запись без повторных расчетов.
            Информационный отчет. Не является налоговой, юридической, финансовой или
            AML-консультацией.
          </p>
        </div>
      </section>
    </div>
  );
}
