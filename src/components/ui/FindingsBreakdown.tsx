"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { RiskSummary } from "@/lib/risk/risk-types";

interface FindingsBreakdownProps {
  summary: RiskSummary;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{payload[0].name}:</strong> {payload[0].value}
    </div>
  );
}

export function FindingsBreakdown({ summary }: FindingsBreakdownProps) {
  const data = [
    { name: "Критичные", value: summary.criticalCount, color: "#ff6b6b" },
    { name: "Средние", value: summary.mediumCount, color: "#ffbd5a" },
    { name: "Низкие", value: summary.lowCount, color: "#1a82ff" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <p className="muted" style={{ fontSize: 13 }}>
        Findings не обнаружены.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--muted)", fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={700}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
