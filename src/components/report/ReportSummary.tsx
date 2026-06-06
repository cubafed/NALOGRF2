import type { ReadinessLabel, RiskSummary } from "@/lib/risk/risk-types";
import { AlertTriangle, AlertCircle, TrendingDown } from "lucide-react";
import { ReadinessGauge } from "@/components/ui/ReadinessGauge";
import { FindingsBreakdown } from "@/components/ui/FindingsBreakdown";
import { StatCard } from "@/components/ui/StatCard";

interface ReportSummaryProps {
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  riskSummary: RiskSummary;
}

export function ReportSummary({ readinessScore, readinessLabel, riskSummary }: ReportSummaryProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Готовность отчета</p>

        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <ReadinessGauge score={readinessScore} label={readinessLabel} size={180} />

          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <StatCard
                icon={<AlertTriangle size={16} color="var(--red)" />}
                iconBg="var(--red-soft)"
                value={riskSummary.criticalCount}
                label="Критичных"
                valueColor={riskSummary.criticalCount > 0 ? "var(--red)" : undefined}
              />
              <StatCard
                icon={<AlertCircle size={16} color="var(--amber)" />}
                iconBg="var(--amber-soft)"
                value={riskSummary.mediumCount}
                label="Средних"
                valueColor={riskSummary.mediumCount > 0 ? "var(--amber)" : undefined}
              />
              <StatCard
                icon={<TrendingDown size={16} color="var(--blue)" />}
                iconBg="var(--blue-soft)"
                value={riskSummary.affectedTransactionCount}
                label="Строк затронуто"
              />
            </div>

            {riskSummary.totalFindings > 0 && (
              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Breakdown по severity</p>
                <FindingsBreakdown summary={riskSummary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
