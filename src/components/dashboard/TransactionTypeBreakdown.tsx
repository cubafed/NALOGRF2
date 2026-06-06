import type { TransactionTypeBreakdown as Breakdown } from "@/lib/metrics/analytics-types";
import { dashboardTransactionTypes } from "@/lib/metrics/calculate-transaction-type-breakdown";

interface TransactionTypeBreakdownProps {
  breakdown: Breakdown;
}

export function TransactionTypeBreakdown({ breakdown }: TransactionTypeBreakdownProps) {
  const max = Math.max(...dashboardTransactionTypes.map((type) => breakdown[type]), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Transaction types</p>
        <h2 style={{ margin: "0 0 16px" }}>Типы операций</h2>
        <div className="dashboard-bars">
          {dashboardTransactionTypes.map((type) => (
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
