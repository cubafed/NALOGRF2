import type { DemoReport } from "@/lib/domain/types";

export function ReportPreviewPanel({ report }: { report: DemoReport }) {
  const rows = [
    ["Нет истории приобретения", report.metrics.missingCostBasis],
    ["P2P-поступления", report.metrics.p2pInflows],
    ["Крупные фиатные выводы", report.metrics.largeFiatWithdrawals],
    ["Несопоставленные переводы", report.metrics.unmatchedTransfers],
    ["Неизвестные кошельки-источники", report.metrics.unknownSourceWallets],
  ];

  return (
    <div className="panel" aria-label="Превью отчета">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Предпросмотр отчета</p>
            <h2 style={{ margin: 0 }}>Готовность по источнику средств</h2>
          </div>
          <span className="badge">Демо-данные</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Операции</span>
            <strong>{report.operationsCount}</strong>
          </div>
          <div className="metric">
            <span>Период</span>
            <strong>{report.period.label}</strong>
          </div>
          <div className="metric">
            <span>Готовность</span>
            <strong>{report.readinessScore}/100</strong>
          </div>
          <div className="metric">
            <span>Оценка риска</span>
            <strong>{report.riskScore}/100</strong>
          </div>
        </div>
        <div className="report-list" style={{ marginTop: "18px" }}>
          {rows.map(([label, value]) => (
            <div className="report-row" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              <span className="muted">требует проверки</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
