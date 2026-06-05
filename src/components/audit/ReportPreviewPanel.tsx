import type { DemoReport } from "@/lib/domain/types";

export function ReportPreviewPanel({ report }: { report: DemoReport }) {
  const rows = [
    ["Missing cost basis", report.metrics.missingCostBasis],
    ["P2P inflows", report.metrics.p2pInflows],
    ["Large fiat withdrawals", report.metrics.largeFiatWithdrawals],
    ["Unmatched transfers", report.metrics.unmatchedTransfers],
    ["Unknown source wallets", report.metrics.unknownSourceWallets],
  ];

  return (
    <div className="panel" aria-label="Превью отчета">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Report preview</p>
            <h2 style={{ margin: 0 }}>Source-of-Funds readiness</h2>
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
            <span>Readiness</span>
            <strong>{report.readinessScore}/100</strong>
          </div>
          <div className="metric">
            <span>Risk score</span>
            <strong>{report.riskScore}/100</strong>
          </div>
        </div>
        <div className="report-list" style={{ marginTop: "18px" }}>
          {rows.map(([label, value]) => (
            <div className="report-row" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              <span className="muted">needs review</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
