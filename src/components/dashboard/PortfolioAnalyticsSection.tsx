"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";
import { AlertCircle } from "lucide-react";
import type { Transaction } from "@/lib/domain/types";
import { calculatePortfolio } from "@/lib/portfolio";
import { createRateLookup } from "@/lib/tax/rates/convert";

interface PortfolioAnalyticsSectionProps {
  transactions: Transaction[];
  reportCurrency: string;
}

const COLORS = ["#1a82ff", "#00c87a", "#ffbd5a", "#b07bff", "#ff6b6b", "#33c2c2", "#8c8c8c"];

function formatNum(v: number, digits = 2): string {
  return v.toLocaleString("ru-RU", { maximumFractionDigits: digits });
}

export function PortfolioAnalyticsSection({
  transactions,
  reportCurrency,
}: PortfolioAnalyticsSectionProps) {
  const portfolio = useMemo(
    () => calculatePortfolio({ transactions, rates: createRateLookup(reportCurrency) }),
    [transactions, reportCurrency],
  );

  const held = portfolio.holdings.filter((h) => h.quantity > 0);

  // Allocation: by remaining cost basis when known, else by quantity (labelled).
  const allByCost = held.length > 0 && held.every((h) => h.costBasisReport !== null);
  const allocation = held
    .map((h) => ({
      name: h.asset,
      value: allByCost ? (h.costBasisReport ?? 0) : h.quantity,
    }))
    .filter((a) => a.value > 0)
    .sort((a, b) => b.value - a.value);

  const realized = portfolio.holdings
    .filter((h) => h.realizedGainReport !== 0)
    .map((h) => ({ name: h.asset, value: h.realizedGainReport }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const isEmpty = held.length === 0 && realized.length === 0;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Портфель</p>
            <h2 style={{ margin: 0, fontSize: 20 }}>Активы и P&amp;L</h2>
          </div>
          <span className="badge">{reportCurrency}</span>
        </div>

        {isEmpty ? (
          <div style={{ padding: "28px 0", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Нет данных портфеля (нужны операции покупки/получения и продажи).
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 22, marginTop: 14 }}>
            {/* Allocation donut */}
            {allocation.length > 0 && (
              <div>
                <p className="eyebrow" style={{ margin: "0 0 8px" }}>
                  Аллокация {allByCost ? "по себестоимости" : "по количеству"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocation}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={72}
                          paddingAngle={2}
                          isAnimationActive
                          animationDuration={600}
                        >
                          {allocation.map((entry, i) => (
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
                            allByCost ? `${formatNum(Number(v))} ${reportCurrency}` : `${formatNum(Number(v), 6)} ед.`,
                            item?.payload?.name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 160 }}>
                    {allocation.map((entry, i) => (
                      <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{entry.name}</span>
                        <span className="muted">
                          {allByCost ? `${formatNum(entry.value)} ${reportCurrency}` : `${formatNum(entry.value, 4)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Realized P&L bar */}
            {realized.length > 0 && (
              <div>
                <p className="eyebrow" style={{ margin: "0 0 8px" }}>
                  Реализованный P&amp;L по активам · {reportCurrency}
                </p>
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realized} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--panel-2)",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${formatNum(Number(v))} ${reportCurrency}`, "P&L"]}
                      />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={40} isAnimationActive animationDuration={600}>
                        {realized.map((entry) => (
                          <Cell key={entry.name} fill={entry.value >= 0 ? "#00c87a" : "#ff6b6b"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Holdings table */}
            {held.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Актив</th>
                      <th>Количество</th>
                      <th>Себестоимость, {reportCurrency}</th>
                      <th>Реализованный P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {held.map((h) => (
                      <tr key={h.asset}>
                        <td>{h.asset}</td>
                        <td>{formatNum(h.quantity, 6)}</td>
                        <td>{h.costBasisReport === null ? "—" : formatNum(h.costBasisReport)}</td>
                        <td style={{ color: h.realizedGainReport >= 0 ? "var(--green)" : "var(--red)" }}>
                          {formatNum(h.realizedGainReport)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {portfolio.warnings.length > 0 && (
              <div style={{ display: "grid", gap: 6 }}>
                {portfolio.warnings.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--amber-soft)",
                      border: "1px solid rgba(255,189,90,0.2)",
                      fontSize: 12,
                      color: "var(--amber)",
                    }}
                  >
                    <AlertCircle size={12} style={{ flexShrink: 0 }} />
                    {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
