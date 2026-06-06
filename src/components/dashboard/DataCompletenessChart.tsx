"use client";

import type { DataCompletenessResult } from "@/lib/metrics/analytics-types";
import { CheckCircle2, AlertTriangle, XCircle, Calendar, Tag, DollarSign } from "lucide-react";

interface DataCompletenessChartProps {
  result: DataCompletenessResult;
}

function BarRow({
  label,
  count,
  total,
  color,
  icon,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 16, flexShrink: 0, color }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: "var(--fg)" }}>{label}</span>
          <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
            {count.toLocaleString("ru-RU")} ({pct}%)
          </span>
        </div>
        <div className="completeness-bar-track">
          <div
            className="completeness-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

function MissingRow({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: "var(--radius-sm)",
        background: "var(--panel-2)",
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--amber)", flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "var(--muted-strong)", flex: 1 }}>{label}</span>
      <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
        {count.toLocaleString("ru-RU")}
      </span>
    </div>
  );
}

export function DataCompletenessChart({ result }: DataCompletenessChartProps) {
  const {
    totalRows,
    completeRows,
    warningRows,
    errorRows,
    completenessPercent,
    missingFiatValueRows,
    missingAmountRows,
    invalidDateRows,
    unknownTypeRows,
  } = result;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="eyebrow" style={{ margin: 0 }}>Полнота данных</p>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: completenessPercent >= 90 ? "var(--green)" : completenessPercent >= 70 ? "var(--amber)" : "var(--red)",
            }}
          >
            {completenessPercent}%
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <BarRow
            label="Полные строки"
            count={completeRows}
            total={totalRows}
            color="var(--green)"
            icon={<CheckCircle2 size={14} />}
          />
          <BarRow
            label="С предупреждениями"
            count={warningRows}
            total={totalRows}
            color="var(--amber)"
            icon={<AlertTriangle size={14} />}
          />
          <BarRow
            label="С ошибками"
            count={errorRows}
            total={totalRows}
            color="var(--red)"
            icon={<XCircle size={14} />}
          />
        </div>

        {(missingFiatValueRows > 0 || missingAmountRows > 0 || invalidDateRows > 0 || unknownTypeRows > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Отсутствующие поля
            </p>
            <MissingRow
              icon={<DollarSign size={12} />}
              label="Без fiatValue"
              count={missingFiatValueRows}
            />
            <MissingRow
              icon={<Tag size={12} />}
              label="Без суммы (amount)"
              count={missingAmountRows}
            />
            <MissingRow
              icon={<Calendar size={12} />}
              label="Неверная дата"
              count={invalidDateRows}
            />
            <MissingRow
              icon={<AlertTriangle size={12} />}
              label="Неизвестный тип"
              count={unknownTypeRows}
            />
          </div>
        )}

        {totalRows === 0 && (
          <p className="muted" style={{ margin: 0, fontSize: 13, textAlign: "center", padding: "16px 0" }}>
            Нет загруженных данных
          </p>
        )}
      </div>
    </section>
  );
}
