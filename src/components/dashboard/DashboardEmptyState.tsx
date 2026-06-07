"use client";

import Link from "next/link";
import { Upload, Info } from "lucide-react";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import { calculateFiatFlow } from "@/lib/metrics/calculate-fiat-flow";
import { calculateDataCompleteness } from "@/lib/metrics/calculate-data-completeness";
import { calculateSourceCoverage } from "@/lib/metrics/calculate-source-coverage";
import { calculateMonthlyActivity } from "@/lib/metrics/calculate-monthly-activity";
import { FiatInflowOutflowChart } from "./FiatInflowOutflowChart";
import { DataCompletenessChart } from "./DataCompletenessChart";
import { SourceCoverageChart } from "./SourceCoverageChart";
import { TransactionActivityChart } from "./TransactionActivityChart";
import { DashboardSummaryPanel } from "./DashboardSummaryPanel";
import type { ImportSession } from "@/lib/client/import-session-storage";

const parsed = parseUniversalCsv(sampleUniversalCsv);

const demoSession: ImportSession = {
  version: 1,
  savedAt: new Date().toISOString(),
  fileName: "demo.csv",
  parserSummary: parsed.summary,
  transactions: parsed.transactions,
  parserWarnings: parsed.warnings,
  parserErrors: parsed.errors,
  rawRows: parsed.rawRows,
  riskResult: {
    findings: [],
    readinessScore: 0,
    readinessLabel: "needs_review",
    summary: {
      totalFindings: 0,
      criticalCount: 0,
      mediumCount: 0,
      lowCount: 0,
      affectedTransactionCount: 0,
      rulesTriggered: [],
    },
  },
};

const demoFiatFlow = calculateFiatFlow(demoSession.transactions);
const demoCompleteness = calculateDataCompleteness({
  rawRows: demoSession.rawRows,
  parserWarnings: demoSession.parserWarnings,
  parserErrors: demoSession.parserErrors,
  transactions: demoSession.transactions,
});
const demoSourceCoverage = calculateSourceCoverage({
  transactions: demoSession.transactions,
  parserWarnings: demoSession.parserWarnings,
  parserErrors: demoSession.parserErrors,
});
const demoMonthlyActivity = calculateMonthlyActivity(demoSession.transactions);

export function DashboardEmptyState() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(26,130,255,0.08)",
          border: "1px solid rgba(26,130,255,0.18)",
          marginBottom: 24,
          fontSize: 13,
        }}
      >
        <Info size={14} style={{ flexShrink: 0, color: "var(--blue)" }} />
        <span style={{ color: "var(--muted-strong)", flex: 1 }}>
          Демо-данные — загрузите CSV чтобы увидеть свою аналитику
        </span>
        <Link
          href="/upload"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--blue)",
            textDecoration: "none",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <Upload size={12} />
          Загрузить
        </Link>
      </div>

      <DashboardSummaryPanel
        session={demoSession}
        fiatFlow={demoFiatFlow}
        completeness={demoCompleteness}
        sourceCoverage={demoSourceCoverage}
      />

      <div style={{ height: 18 }} />

      <div className="dashboard-grid">
        <FiatInflowOutflowChart result={demoFiatFlow} />
        <DataCompletenessChart result={demoCompleteness} />
        <TransactionActivityChart result={demoMonthlyActivity} />
        <SourceCoverageChart result={demoSourceCoverage} />
      </div>
    </div>
  );
}
