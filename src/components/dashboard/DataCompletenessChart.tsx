import type { DataCompletenessMetrics } from "@/lib/analytics/analytics-types";

interface DataCompletenessChartProps {
  metrics: DataCompletenessMetrics;
}

export function DataCompletenessChart({ metrics }: DataCompletenessChartProps) {
  const completePercent = metrics.importCompletenessPercent;
  const incompletePercent = metrics.totalRows > 0 ? 100 - completePercent : 0;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Data completeness</p>
            <h2 style={{ margin: 0 }}>Complete vs incomplete rows</h2>
          </div>
          <span className="badge">{completePercent}% complete</span>
        </div>
        <div className="progress-track" aria-label="Data completeness">
          <span style={{ width: `${completePercent}%` }} />
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Complete rows</span>
            <strong>{metrics.completeRows}</strong>
          </div>
          <div className="metric">
            <span>Incomplete rows</span>
            <strong>{metrics.incompleteRows}</strong>
          </div>
          <div className="metric">
            <span>Complete</span>
            <strong>{completePercent}%</strong>
          </div>
          <div className="metric">
            <span>Incomplete</span>
            <strong>{incompletePercent}%</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
