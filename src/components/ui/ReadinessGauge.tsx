"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import type { ReadinessLabel } from "@/lib/risk/risk-types";

interface ReadinessGaugeProps {
  score: number;
  label: ReadinessLabel;
  size?: number;
}

const LABEL_RU: Record<ReadinessLabel, string> = {
  good: "Готов",
  needs_review: "Требует проверки",
  high_risk: "Высокий риск",
};

const COLOR: Record<ReadinessLabel, string> = {
  good: "#00c87a",
  needs_review: "#ffbd5a",
  high_risk: "#ff6b6b",
};

export function ReadinessGauge({ score, label, size = 180 }: ReadinessGaugeProps) {
  const color = COLOR[label];
  const data = [{ value: score, fill: color }];

  return (
    <div className="gauge-wrap" style={{ width: size }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={200}
            endAngle={-20}
            data={data}
            barSize={10}
          >
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.06)" }}
              dataKey="value"
              cornerRadius={5}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: size < 160 ? 26 : 34,
              fontWeight: 950,
              lineHeight: 1,
              color,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "var(--muted)",
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            /100
          </span>
        </div>
      </div>

      <span
        className="gauge-label"
        style={{ color }}
      >
        {LABEL_RU[label]}
      </span>
    </div>
  );
}
