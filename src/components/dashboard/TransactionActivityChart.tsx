import type { TransactionActivityPoint } from "@/lib/metrics/analytics-types";

interface TransactionActivityChartProps {
  points: TransactionActivityPoint[];
}

export function TransactionActivityChart({ points }: TransactionActivityChartProps) {
  const max = Math.max(...points.map((point) => point.count), 1);

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Transaction activity</p>
        <h2 style={{ margin: "0 0 16px" }}>Операции по месяцам</h2>
        {points.length === 0 ? (
          <p className="muted">Нет операций с корректной датой для построения timeline.</p>
        ) : (
          <div className="monthly-chart">
            {points.map((point) => (
              <div className="monthly-bar" key={point.month}>
                <span style={{ height: `${Math.max(8, Math.round((point.count / max) * 120))}px` }} />
                <strong>{point.count}</strong>
                <small>{point.month}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
