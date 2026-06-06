import type { ReactNode } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  icon: ReactNode;
  iconBg?: string;
  value: number;
  label: string;
  valueColor?: string;
  animate?: boolean;
}

export function StatCard({
  icon,
  iconBg = "rgba(26,130,255,0.12)",
  value,
  label,
  valueColor,
  animate = true,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="stat-card-value" style={valueColor ? { color: valueColor } : undefined}>
        {animate ? <AnimatedCounter value={value} /> : value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
