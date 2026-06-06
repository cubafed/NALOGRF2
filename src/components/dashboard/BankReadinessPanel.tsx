import type { AnalyticsDashboardModel } from "@/lib/analytics/analytics-types";

interface BankReadinessPanelProps {
  dashboard: AnalyticsDashboardModel;
}

function countRule(dashboard: AnalyticsDashboardModel, ruleId: string): number {
  return dashboard.findingsByRuleId.find((finding) => finding.label === ruleId)?.count ?? 0;
}

export function BankReadinessPanel({ dashboard }: BankReadinessPanelProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Готовность к проверке</p>
            <h2 style={{ margin: 0 }}>Bank readiness</h2>
          </div>
          <span className="badge">{dashboard.readinessLabel}</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Readiness score</span>
            <strong>{dashboard.readinessScore}/100</strong>
          </div>
          <div className="metric">
            <span>Source-of-funds gaps</span>
            <strong>{dashboard.sourceOfFundsGapCount}</strong>
          </div>
          <div className="metric">
            <span>Missing cost basis</span>
            <strong>{countRule(dashboard, "missing_cost_basis_basic")}</strong>
          </div>
          <div className="metric">
            <span>P2P inflow</span>
            <strong>{countRule(dashboard, "large_p2p_inflow")}</strong>
          </div>
          <div className="metric">
            <span>Large fiat withdrawal</span>
            <strong>{countRule(dashboard, "large_fiat_withdrawal")}</strong>
          </div>
          <div className="metric">
            <span>Unknown wallet/source</span>
            <strong>{countRule(dashboard, "unknown_source_wallet")}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginBottom: 0, marginTop: "16px" }}>
          Панель показывает готовность к проверке по существующим детерминированным
          проблемам. Она не обещает одобрение банка.
        </p>
      </div>
    </section>
  );
}
