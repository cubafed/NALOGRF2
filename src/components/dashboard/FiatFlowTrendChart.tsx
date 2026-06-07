"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { FiatFlowResult } from "@/lib/metrics/analytics-types";
import { calculateCumulativeFlow } from "@/lib/metrics/calculate-cumulative-flow";

interface FiatFlowTrendChartProps {
  result: FiatFlowResult;
}

function formatFiat(v: number): string {
  return v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

function monthLabel(ym: string): string {
  if (ym === "unknown-date") return "Неизв. дата";
  try {
    const [year, month] = ym.split("-");
    return new Intl.DateTimeFormat("ru-RU", { month: "short", year: "2-digit" }).format(
      new Date(Number(year), Number(month) - 1, 1),
    );
  } catch {
    return ym;
  }
}

function TrendSeries({
  currency,
  points,
}: {
  currency: string;
  points: { month: string; cumulative: number }[];
}) {
  const data = points.map((p) => ({ name: monthLabel(p.month), Накопительно: p.cumulative }));
  const last = points.at(-1)?.cumulative ?? 0;
  const positive = last >= 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p className="eyebrow" style={{ margin: 0 }}>
          Накопительный чистый поток · {currency}
        </p>
        <span style={{ fontSize: 12, color: positive ? "var(--green)" : "var(--red)" }}>
          {positive ? "+" : "−"}
          {formatFiat(Math.abs(last))} {currency}
        </span>
      </div>
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`trend-${currency}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--blue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              formatter={(v) => [`${formatFiat(Number(v))} ${currency}`, undefined]}
            />
            <Area
              type="monotone"
              dataKey="Накопительно"
              stroke="var(--blue)"
              strokeWidth={2}
              fill={`url(#trend-${currency})`}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FiatFlowTrendChart({ result }: FiatFlowTrendChartProps) {
  const { byCurrency } = calculateCumulativeFlow(result);
  const isEmpty = byCurrency.length === 0;

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Тренд денежного потока</p>
        {isEmpty ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Нет данных fiatValue — тренд не определяется
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
            {byCurrency.map((c) => (
              <TrendSeries key={c.currency} currency={c.currency} points={c.points} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
