"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { FiatFlowResult } from "@/lib/metrics/analytics-types";
import { AlertCircle } from "lucide-react";

interface FiatInflowOutflowChartProps {
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
      new Date(Number(year), Number(month) - 1, 1)
    );
  } catch {
    return ym;
  }
}

function CurrencyChart({ currency, months, totalInflow, totalOutflow }: {
  currency: string;
  months: { month: string; inflow: number; outflow: number }[];
  totalInflow: number;
  totalOutflow: number;
}) {
  const data = months.map((m) => ({
    name: monthLabel(m.month),
    "Приток": m.inflow,
    "Отток": m.outflow,
  }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Денежный поток · {currency}
        </p>
        <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
          <span style={{ color: "var(--green)" }}>
            +{formatFiat(totalInflow)} {currency}
          </span>
          <span style={{ color: "var(--red)" }}>
            −{formatFiat(totalOutflow)} {currency}
          </span>
        </div>
      </div>
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2} barCategoryGap="30%">
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
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              formatter={(v) => <span style={{ color: "var(--muted-strong)" }}>{v}</span>}
            />
            <Bar dataKey="Приток" fill="#00c87a" radius={[3, 3, 0, 0]} maxBarSize={32} isAnimationActive animationDuration={600} />
            <Bar dataKey="Отток" fill="#ff6b6b" radius={[3, 3, 0, 0]} maxBarSize={32} isAnimationActive animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FiatInflowOutflowChart({ result }: FiatInflowOutflowChartProps) {
  const { byCurrency, missingFiatValueCount } = result;

  const isEmpty = byCurrency.length === 0;

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Денежный поток по данным CSV</p>

        {missingFiatValueCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--amber-soft)",
              border: "1px solid rgba(255,189,90,0.2)",
              fontSize: 12,
              color: "var(--amber)",
            }}
          >
            <AlertCircle size={12} style={{ flexShrink: 0 }} />
            {missingFiatValueCount} транзакций без fiatValue — не учтены в расчёте
          </div>
        )}

        {isEmpty ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Нет fiatValue в данных CSV — денежный поток не определяется
            </p>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
              Значения рассчитываются только по загруженным данным
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {byCurrency.map((c) => (
              <CurrencyChart key={c.currency} {...c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
