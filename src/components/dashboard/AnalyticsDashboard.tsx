"use client";

import { useEffect, useState } from "react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import { buildAnalyticsDashboard } from "@/lib/metrics/build-analytics-dashboard";
import { DashboardCTA } from "@/components/dashboard/DashboardCTA";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { ImportQualityPanel } from "@/components/dashboard/ImportQualityPanel";
import { ReportReadinessPanel } from "@/components/dashboard/ReportReadinessPanel";
import { SourceCoveragePanel } from "@/components/dashboard/SourceCoveragePanel";
import { SourceOfFundsPanel } from "@/components/dashboard/SourceOfFundsPanel";
import { TransactionActivityChart } from "@/components/dashboard/TransactionActivityChart";
import { TransactionTypeBreakdown } from "@/components/dashboard/TransactionTypeBreakdown";

export function AnalyticsDashboard() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  if (session === "loading") {
    return (
      <section className="panel">
        <div className="panel-inner">
          <p className="muted">Загрузка аналитики...</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return <DashboardEmptyState />;
  }

  const dashboard = buildAnalyticsDashboard(session);

  return (
    <div className="upload-stack">
      <div className="section-head" style={{ marginBottom: "12px" }}>
        <p className="eyebrow">Локальный расчет</p>
        <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
          Аналитика криптоистории
        </h1>
        <p className="lead" style={{ marginTop: "14px" }}>
          Сводка по операциям, качеству импорта, источникам данных и проблемам, которые
          могут потребовать пояснения для банка, бухгалтера или налогового консультанта.
        </p>
      </div>

      <section className="panel">
        <div className="panel-inner">
          <p className="muted" style={{ margin: "0 0 6px" }}>
            Аналитика построена из локального браузерного сеанса. В этом MVP данные не
            отправляются на сервер для расчета аналитики.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Информационный отчет. Не является налоговой, юридической, финансовой или
            AML-консультацией.
          </p>
        </div>
      </section>

      <DashboardSummaryCards summary={dashboard.summary} />

      <div className="dashboard-grid">
        <ImportQualityPanel metrics={dashboard.importQuality} />
        <ReportReadinessPanel metrics={dashboard.reportReadiness} />
      </div>

      <div className="dashboard-grid">
        <SourceCoveragePanel metrics={dashboard.sourceCoverage} />
        <SourceOfFundsPanel metrics={dashboard.sourceOfFunds} />
      </div>

      <div className="dashboard-grid">
        <TransactionActivityChart points={dashboard.transactionActivity} />
        <TransactionTypeBreakdown breakdown={dashboard.transactionTypeBreakdown} />
      </div>

      <DashboardCTA />
    </div>
  );
}
