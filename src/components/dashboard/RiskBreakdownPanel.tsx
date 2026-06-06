import type { AnalyticsDashboardModel } from "@/lib/analytics/analytics-types";

interface RiskBreakdownPanelProps {
  dashboard: AnalyticsDashboardModel;
}

export function RiskBreakdownPanel({ dashboard }: RiskBreakdownPanelProps) {
  const severityRows = [
    { label: "Critical", value: dashboard.findingsBySeverity.critical, className: "severity-critical" },
    { label: "Medium", value: dashboard.findingsBySeverity.medium, className: "severity-medium" },
    { label: "Low", value: dashboard.findingsBySeverity.low, className: "severity-low" },
  ];
  const max = Math.max(...severityRows.map((row) => row.value), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Проблемы для проверки</p>
        <h2 style={{ margin: "0 0 16px" }}>Risk breakdown</h2>
        <div className="dashboard-bars">
          {severityRows.map((row) => (
            <div className="dashboard-bar-row" key={row.label}>
              <span>{row.label}</span>
              <div className="dashboard-bar-track">
                <i
                  className={row.className}
                  style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                />
              </div>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Affected transactions</span>
            <strong>{dashboard.affectedTransactionCount}</strong>
          </div>
          <div className="metric">
            <span>Rule categories</span>
            <strong>{dashboard.findingsByRuleId.length}</strong>
          </div>
        </div>
        {dashboard.findingsByRuleId.length > 0 && (
          <div className="report-list" style={{ marginTop: "16px" }}>
            {dashboard.findingsByRuleId.map((finding) => (
              <div className="report-row" key={finding.label}>
                <strong>{finding.count}</strong>
                <span>{finding.label}</span>
                <span className="muted">ruleId</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
