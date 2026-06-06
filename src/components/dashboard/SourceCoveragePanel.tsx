import type { SourceCoverageMetrics } from "@/lib/metrics/analytics-types";

interface SourceCoveragePanelProps {
  metrics: SourceCoverageMetrics;
}

export function SourceCoveragePanel({ metrics }: SourceCoveragePanelProps) {
  const max = Math.max(...metrics.transactionsPerSource.map((source) => source.count), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Источники данных</p>
            <h2 style={{ margin: 0 }}>Source coverage</h2>
          </div>
          <span className="badge">{metrics.status}</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Unique sources</span>
            <strong>{metrics.uniqueSources}</strong>
          </div>
          <div className="metric">
            <span>Sources with issues</span>
            <strong>{metrics.sourcesWithIssues.length}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "18px" }}>
          Transactions per source, sorted by operation count:
        </p>
        <div className="dashboard-bars">
          {metrics.transactionsPerSource.length === 0 ? (
            <p className="muted">Источники не найдены в локальном сеансе.</p>
          ) : (
            metrics.transactionsPerSource.map((source) => (
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
        {metrics.sourcesWithIssues.length > 0 && (
          <p className="muted">
            Источники с техническими замечаниями: {metrics.sourcesWithIssues.join(", ")}
          </p>
        )}
        <p className="muted" style={{ marginBottom: 0 }}>
          Этот MVP показывает источники из загруженного CSV. Специализированные парсеры
          бирж не реализованы в этом PR.
        </p>
      </div>
    </section>
  );
}
