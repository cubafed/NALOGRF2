import type { RiskEngineResult } from "@/lib/risk/risk-types";
import type { ParserSummary } from "@/lib/parsers/parser-types";
import { AlertTriangle, AlertCircle, TrendingDown, FileText, Clock } from "lucide-react";
import { ReadinessGauge } from "@/components/ui/ReadinessGauge";
import { FindingsBreakdown } from "@/components/ui/FindingsBreakdown";
import { StatCard } from "@/components/ui/StatCard";

interface ProblemsSummaryProps {
  riskResult: RiskEngineResult;
  parserSummary: ParserSummary;
  savedAt: string;
}

export function ProblemsSummary({ riskResult, parserSummary, savedAt }: ProblemsSummaryProps) {
  const { summary, readinessScore, readinessLabel } = riskResult;

  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Анализ готовности</p>

        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {/* Gauge */}
          <ReadinessGauge score={readinessScore} label={readinessLabel} size={180} />

          {/* Stats */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <StatCard
                icon={<AlertTriangle size={16} color="var(--red)" />}
                iconBg="var(--red-soft)"
                value={summary.criticalCount}
                label="Критичных"
                valueColor={summary.criticalCount > 0 ? "var(--red)" : undefined}
              />
              <StatCard
                icon={<AlertCircle size={16} color="var(--amber)" />}
                iconBg="var(--amber-soft)"
                value={summary.mediumCount}
                label="Средних"
                valueColor={summary.mediumCount > 0 ? "var(--amber)" : undefined}
              />
              <StatCard
                icon={<TrendingDown size={16} color="var(--blue)" />}
                iconBg="var(--blue-soft)"
                value={summary.affectedTransactionCount}
                label="Строк затронуто"
              />
              <StatCard
                icon={<FileText size={16} color="var(--muted)" />}
                iconBg="rgba(255,255,255,0.06)"
                value={parserSummary.transactionCount}
                label="Транзакций всего"
              />
            </div>

            {/* Breakdown chart */}
            {summary.totalFindings > 0 && (
              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Breakdown по severity</p>
                <FindingsBreakdown summary={summary} />
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--line)",
          }}
        >
          <Clock size={12} color="var(--muted)" />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Загружено: {new Date(savedAt).toLocaleString("ru-RU")}
          </span>
          {(parserSummary.errorCount > 0 || parserSummary.warningCount > 0) && (
            <span style={{ fontSize: 12, color: "var(--amber)", marginLeft: 8 }}>
              · {parserSummary.errorCount > 0 && `${parserSummary.errorCount} ошибок`}
              {parserSummary.warningCount > 0 && ` ${parserSummary.warningCount} предупреждений`} парсера
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
