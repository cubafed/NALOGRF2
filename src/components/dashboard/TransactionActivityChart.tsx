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
import type { MonthlyActivityResult } from "@/lib/metrics/analytics-types";

interface TransactionActivityChartProps {
  result: MonthlyActivityResult;
}

export function TransactionActivityChart({ result }: TransactionActivityChartProps) {
  const { buckets, invalidDateCount } = result;

  const isEmpty = buckets.length === 0;

  const data = buckets.map((b) => ({
    name: b.label,
    count: b.count,
    isInvalid: b.month === "invalid-date",
  }));

  return (
    <section className="panel">
      <div className="panel-inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p className="eyebrow" style={{ margin: 0 }}>Активность по месяцам</p>
          {invalidDateCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--amber)" }}>
              {invalidDateCount} с неверной датой
            </span>
          )}
        </div>

        {isEmpty ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Нет транзакций для отображения
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel-2)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                  }}
                  formatter={(v) => [Number(v).toLocaleString("ru-RU"), "Транзакций"]}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={32} isAnimationActive animationDuration={600}>
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isInvalid ? "#f59e0b" : "var(--blue)"}
                      opacity={entry.isInvalid ? 0.7 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
