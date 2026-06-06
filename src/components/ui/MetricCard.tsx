import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  secondary?: ReactNode;
  variant?: "neutral" | "info" | "success" | "warning" | "danger";
}

export function MetricCard({
  label,
  value,
  helper,
  secondary,
  variant = "neutral",
}: MetricCardProps) {
  return (
    <div className={`metric metric-${variant}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
      {secondary && <em>{secondary}</em>}
    </div>
  );
}
