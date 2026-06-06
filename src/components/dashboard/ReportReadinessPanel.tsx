import type { ReportReadinessMetrics } from "@/lib/metrics/analytics-types";
import { FindingSeverityChart } from "@/components/dashboard/FindingSeverityChart";

interface ReportReadinessPanelProps {
  metrics: ReportReadinessMetrics;
}

export function ReportReadinessPanel({ metrics }: ReportReadinessPanelProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Готовность отчета</p>
            <h2 style={{ margin: 0 }}>Report readiness</h2>
          </div>
          <span className="badge">{metrics.readinessLabel}</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Readiness score</span>
            <strong>{metrics.readinessScore}/100</strong>
          </div>
          <div className="metric">
            <span>Parser issues</span>
            <strong>{metrics.parserIssueCount}</strong>
          </div>
          <div className="metric">
            <span>Documents needed</span>
            <strong>{metrics.uniqueDocumentsNeeded}</strong>
          </div>
          <div className="metric">
            <span>Next action</span>
            <strong style={{ fontSize: "15px" }}>{metrics.recommendedNextAction}</strong>
          </div>
        </div>
        <FindingSeverityChart
          critical={metrics.criticalFindings}
          medium={metrics.mediumFindings}
          low={metrics.lowFindings}
        />
      </div>
    </section>
  );
}
