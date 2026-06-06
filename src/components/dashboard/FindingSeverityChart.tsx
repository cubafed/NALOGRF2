interface FindingSeverityChartProps {
  critical: number;
  medium: number;
  low: number;
}

export function FindingSeverityChart({ critical, medium, low }: FindingSeverityChartProps) {
  const rows = [
    { label: "Critical", value: critical, className: "severity-critical" },
    { label: "Medium", value: medium, className: "severity-medium" },
    { label: "Low", value: low, className: "severity-low" },
  ];
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="dashboard-bars" style={{ marginTop: "18px" }}>
      {rows.map((row) => (
        <div className="dashboard-bar-row" key={row.label}>
          <span>{row.label}</span>
          <div className="dashboard-bar-track">
            <i
              className={row.className}
              style={{ width: `${Math.round((row.value / max) * 100)}%` }}
            />
          </div>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}
