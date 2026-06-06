import type { ImportQualityMetrics } from "@/lib/metrics/analytics-types";

interface ImportQualityPanelProps {
  metrics: ImportQualityMetrics;
}

export function ImportQualityPanel({ metrics }: ImportQualityPanelProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Качество импорта</p>
            <h2 style={{ margin: 0 }}>Import quality</h2>
          </div>
          <span className="badge">{metrics.importCompletenessPercent}% parsed</span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Total raw rows</span>
            <strong>{metrics.totalRows}</strong>
          </div>
          <div className="metric">
            <span>Parsed rows</span>
            <strong>{metrics.parsedRows}</strong>
          </div>
          <div className="metric">
            <span>Rows with warnings</span>
            <strong>{metrics.warningRows}</strong>
          </div>
          <div className="metric">
            <span>Rows with errors</span>
            <strong>{metrics.errorRows}</strong>
          </div>
          <div className="metric">
            <span>Missing amount</span>
            <strong>{metrics.missingAmountCount}</strong>
          </div>
          <div className="metric">
            <span>Invalid numeric value</span>
            <strong>{metrics.invalidNumericValueCount}</strong>
          </div>
          <div className="metric">
            <span>Unknown transaction type</span>
            <strong>{metrics.unknownTransactionTypeCount}</strong>
          </div>
        </div>
        <div className="progress-track" aria-label="Import completeness">
          <span style={{ width: `${metrics.importCompletenessPercent}%` }} />
        </div>
      </div>
    </section>
  );
}
