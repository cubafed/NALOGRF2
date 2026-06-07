"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadLatestImportSession } from "@/lib/client/import-session-storage";
import type { ImportSession } from "@/lib/client/import-session-storage";
import { calculateFiatFlow } from "@/lib/metrics/calculate-fiat-flow";
import { calculateDataCompleteness } from "@/lib/metrics/calculate-data-completeness";
import { calculateSourceCoverage } from "@/lib/metrics/calculate-source-coverage";
import { calculateMonthlyActivity } from "@/lib/metrics/calculate-monthly-activity";
import { loadJurisdictionPreference } from "@/lib/client/jurisdiction-preference-storage";
import { getJurisdictionInfo } from "@/lib/tax/jurisdictions";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardSummaryPanel } from "./DashboardSummaryPanel";
import { FiatInflowOutflowChart } from "./FiatInflowOutflowChart";
import { FiatFlowTrendChart } from "./FiatFlowTrendChart";
import { DataCompletenessChart } from "./DataCompletenessChart";
import { SourceCoverageChart } from "./SourceCoverageChart";
import { SourceDistributionChart } from "./SourceDistributionChart";
import { TransactionActivityChart } from "./TransactionActivityChart";
import { PortfolioAnalyticsSection } from "./PortfolioAnalyticsSection";

export function AnalyticsDashboard() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  if (session === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <SkeletonCard height={80} lines={2} />
        <SkeletonCard height={160} lines={3} />
        <SkeletonCard height={160} lines={3} />
      </div>
    );
  }

  if (session === null) {
    return <DashboardEmptyState />;
  }

  const fiatFlow = calculateFiatFlow(session.transactions);
  const completeness = calculateDataCompleteness({
    rawRows: session.rawRows,
    parserWarnings: session.parserWarnings,
    parserErrors: session.parserErrors,
    transactions: session.transactions,
  });
  const sourceCoverage = calculateSourceCoverage({
    transactions: session.transactions,
    parserWarnings: session.parserWarnings,
    parserErrors: session.parserErrors,
  });
  const monthlyActivity = calculateMonthlyActivity(session.transactions);
  const reportCurrency =
    getJurisdictionInfo(loadJurisdictionPreference())?.reportCurrency ?? "RUB";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <DashboardSummaryPanel
        session={session}
        fiatFlow={fiatFlow}
        completeness={completeness}
        sourceCoverage={sourceCoverage}
      />

      <div style={{ height: 18 }} />

      <div className="dashboard-grid">
        <FiatInflowOutflowChart result={fiatFlow} />
        <FiatFlowTrendChart result={fiatFlow} />
        <SourceDistributionChart result={sourceCoverage} />
        <TransactionActivityChart result={monthlyActivity} />
        <DataCompletenessChart result={completeness} />
        <SourceCoverageChart result={sourceCoverage} />
      </div>

      <div style={{ height: 18 }} />

      <PortfolioAnalyticsSection
        transactions={session.transactions}
        reportCurrency={reportCurrency}
      />

      <p
        style={{
          marginTop: 24,
          fontSize: 11,
          color: "var(--muted)",
          textAlign: "center",
        }}
      >
        Локальная аналитика — данные остаются в браузере
      </p>
    </motion.div>
  );
}
