import type { AnalyticsDashboardModel } from "@/lib/analytics/analytics-types";

interface ImportQualityPanelProps {
  dashboard: AnalyticsDashboardModel;
}

export function ImportQualityPanel({ dashboard }: ImportQualityPanelProps) {
  const { dataCompleteness } = dashboard;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Качество импорта</p>
            <h2 style={{ margin: 0 }}>Import quality</h2>
          </div>
          <span className="badge">{dashboard.importCompletenessPercent}% complete</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Parsed rows</span>
            <strong>{dataCompleteness.parsedRows}</strong>
          </div>
          <div className="metric">
            <span>Rows with warnings</span>
            <strong>{dataCompleteness.warningRows}</strong>
          </div>
          <div className="metric">
            <span>Rows with errors</span>
            <strong>{dataCompleteness.errorRows}</strong>
          </div>
          <div className="metric">
            <span>Missing fiat value</span>
            <strong>{dashboard.missingFiatValueCount}</strong>
          </div>
          <div className="metric">
            <span>Unknown transaction type</span>
            <strong>{dashboard.unknownTransactionTypeCount}</strong>
          </div>
          <div className="metric">
            <span>Incomplete rows</span>
            <strong>{dataCompleteness.incompleteRows}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
