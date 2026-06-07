"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SourceCoverageResult } from "@/lib/metrics/analytics-types";

interface SourceDistributionChartProps {
  result: SourceCoverageResult;
}

// Palette drawn from the theme accent colors; reused cyclically for sources.
const COLORS = ["#1a82ff", "#00c87a", "#ffbd5a", "#b07bff", "#ff6b6b", "#33c2c2", "#8c8c8c"];

export function SourceDistributionChart({ result }: SourceDistributionChartProps) {
  const entries = result.entries;
  const isEmpty = entries.length === 0;

  const data = entries.map((e) => ({
    name: e.source,
    value: e.transactionCount,
    percent: e.percent,
  }));

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Распределение по источникам</p>

        {isEmpty ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Нет операций для распределения
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <div style={{ width: 180, height: 180, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={600}
                  >
                    {data.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="var(--panel)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                    }}
                    formatter={(v, _n, item) => [
                      `${v} оп. (${(item?.payload?.percent ?? 0).toFixed(0)}%)`,
                      item?.payload?.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
              {data.map((entry, i) => (
                <div
                  key={entry.name}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: COLORS[i % COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{entry.name}</span>
                  <span className="muted">{entry.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.unknownSourceCount > 0 && (
          <p className="muted" style={{ margin: "12px 0 0", fontSize: 12 }}>
            {result.unknownSourceCount} операц. без источника — стоит уточнить происхождение.
          </p>
        )}
      </div>
    </section>
  );
}
