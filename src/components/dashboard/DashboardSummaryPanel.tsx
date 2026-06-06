"use client";

import { TrendingUp, TrendingDown, Activity, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { FiatFlowResult, DataCompletenessResult } from "@/lib/metrics/analytics-types";
import type { ImportSession } from "@/lib/client/import-session-storage";

interface DashboardSummaryPanelProps {
  session: ImportSession;
  fiatFlow: FiatFlowResult;
  completeness: DataCompletenessResult;
}

function formatFiat(v: number): string {
  return v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

export function DashboardSummaryPanel({
  session,
  fiatFlow,
  completeness,
}: DashboardSummaryPanelProps) {
  const totalTx = session.parserSummary.transactionCount;

  const dominantCurrency = fiatFlow.byCurrency[0];
  const extraCurrencies = fiatFlow.byCurrency.length - 1;
  const inflowValue = dominantCurrency?.totalInflow ?? 0;
  const outflowValue = dominantCurrency?.totalOutflow ?? 0;
  const currencyLabel = dominantCurrency
    ? extraCurrencies > 0
      ? `${dominantCurrency.currency} (+${extraCurrencies} вал.)`
      : dominantCurrency.currency
    : "—";

  const completePct = completeness.completenessPercent;
  const completenessColor =
    completePct >= 90 ? "var(--green)" : completePct >= 70 ? "var(--amber)" : "var(--red)";

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Сводка</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard
            icon={<TrendingUp size={16} color="var(--green)" />}
            iconBg="rgba(0,200,122,0.12)"
            value={inflowValue}
            label={`Приток · ${currencyLabel}`}
            valueColor="var(--green)"
          />
          <StatCard
            icon={<TrendingDown size={16} color="var(--red)" />}
            iconBg="rgba(255,107,107,0.12)"
            value={outflowValue}
            label={`Отток · ${currencyLabel}`}
            valueColor="var(--red)"
          />
          <StatCard
            icon={<Activity size={16} color="var(--blue)" />}
            iconBg="rgba(26,130,255,0.12)"
            value={totalTx}
            label="Транзакций"
          />
          <StatCard
            icon={<CheckCircle2 size={16} color={completenessColor} />}
            iconBg={`rgba(0,0,0,0.06)`}
            value={completePct}
            label="Полнота данных, %"
            valueColor={completenessColor}
          />
        </div>

        {dominantCurrency && (
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            Значения рассчитаны только по загруженным данным · {formatFiat(inflowValue)} / {formatFiat(outflowValue)} {dominantCurrency.currency}
          </p>
        )}
      </div>
    </section>
  );
}
