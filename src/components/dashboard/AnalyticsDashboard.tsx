"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import { buildAnalyticsDashboard } from "@/lib/analytics/build-analytics-dashboard";
import { AnalyticsEmptyState } from "@/components/dashboard/AnalyticsEmptyState";
import { AnalyticsSummaryCards } from "@/components/dashboard/AnalyticsSummaryCards";
import { BankReadinessPanel } from "@/components/dashboard/BankReadinessPanel";
import { DataCompletenessChart } from "@/components/dashboard/DataCompletenessChart";
import { ImportQualityPanel } from "@/components/dashboard/ImportQualityPanel";
import { RiskBreakdownPanel } from "@/components/dashboard/RiskBreakdownPanel";
import { SourceCoveragePanel } from "@/components/dashboard/SourceCoveragePanel";
import { TransactionTimelineChart } from "@/components/dashboard/TransactionTimelineChart";
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
    return <AnalyticsEmptyState />;
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
          Краткий обзор импортированных операций, качества данных и проблем, которые
          могут потребовать пояснений для банка, бухгалтера или налогового консультанта.
        </p>
      </div>

      <section className="panel">
        <div className="panel-inner">
          <p className="muted" style={{ margin: "0 0 6px" }}>
            Данные берутся из локального браузерного сеанса. В этом MVP аналитика не
            требует облачного сохранения.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Информационный отчет. Не является налоговой, юридической, финансовой или
            AML-консультацией.
          </p>
        </div>
      </section>

      <AnalyticsSummaryCards dashboard={dashboard} />

      <div className="dashboard-grid">
        <ImportQualityPanel dashboard={dashboard} />
        <DataCompletenessChart metrics={dashboard.dataCompleteness} />
      </div>

      <div className="dashboard-grid">
        <SourceCoveragePanel metrics={dashboard.sourceCoverage} />
        <BankReadinessPanel dashboard={dashboard} />
      </div>

      <div className="dashboard-grid">
        <RiskBreakdownPanel dashboard={dashboard} />
        <TransactionTypeBreakdown breakdown={dashboard.transactionsByType} />
      </div>

      <TransactionTimelineChart points={dashboard.monthlyTransactions} />

      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Next steps</p>
              <h2 style={{ margin: 0 }}>Продолжить подготовку отчета</h2>
            </div>
            <div className="actions" style={{ marginTop: 0 }}>
              <Link href="/problems" className="btn btn-secondary">
                Перейти к проблемам
              </Link>
              <Link href="/report" className="btn btn-primary">
                Открыть отчет
              </Link>
              <Link href="/upload" className="btn">
                Загрузить другой CSV
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
