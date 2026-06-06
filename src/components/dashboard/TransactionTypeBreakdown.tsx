import type { TransactionTypeCounts } from "@/lib/analytics/analytics-types";
import { analyticsTransactionTypes } from "@/lib/analytics/build-analytics-dashboard";

interface TransactionTypeBreakdownProps {
  breakdown: TransactionTypeCounts;
}

export function TransactionTypeBreakdown({ breakdown }: TransactionTypeBreakdownProps) {
  const max = Math.max(...analyticsTransactionTypes.map((type) => breakdown[type]), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Transaction types</p>
        <h2 style={{ margin: "0 0 16px" }}>Типы операций</h2>
        <div className="dashboard-bars">
          {analyticsTransactionTypes.map((type) => (
            <div className="dashboard-bar-row" key={type}>
              <span>{type}</span>
              <div className="dashboard-bar-track">
                <i style={{ width: `${Math.round((breakdown[type] / max) * 100)}%` }} />
              </div>
              <strong>{breakdown[type]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
