import type { SourceCoverageMetrics } from "@/lib/analytics/analytics-types";

interface SourceCoveragePanelProps {
  metrics: SourceCoverageMetrics;
}

export function SourceCoveragePanel({ metrics }: SourceCoveragePanelProps) {
  const max = Math.max(...metrics.transactionsBySource.map((source) => source.count), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Источники данных</p>
            <h2 style={{ margin: 0 }}>Source coverage</h2>
          </div>
          <span className="badge">{metrics.sourceCount} sources</span>
        </div>
        <div className="dashboard-bars" style={{ marginTop: "18px" }}>
          {metrics.transactionsBySource.length === 0 ? (
            <p className="muted">Источники не найдены в локальном сеансе.</p>
          ) : (
            metrics.transactionsBySource.map((source) => (
              <div className="dashboard-bar-row" key={source.label}>
                <span>{source.label}</span>
                <div className="dashboard-bar-track">
                  <i style={{ width: `${Math.round((source.count / max) * 100)}%` }} />
                </div>
                <strong>{source.count}</strong>
              </div>
            ))
          )}
        </div>
        {metrics.sourcesWithMostFindings.length > 0 && (
          <div style={{ marginTop: "18px" }}>
            <p className="muted" style={{ margin: "0 0 10px" }}>
              Sources with most findings:
            </p>
            <div className="report-list">
              {metrics.sourcesWithMostFindings.map((source) => (
                <div className="report-row" key={source.label}>
                  <strong>{source.count}</strong>
                  <span>{source.label}</span>
                  <span className="muted">findings</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="muted" style={{ marginBottom: 0, marginTop: "18px" }}>
          {metrics.note}
        </p>
      </div>
    </section>
  );
}
