"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import { buildReportPreview } from "@/lib/report/build-report-preview";
import { ReportHeader } from "./ReportHeader";
import { ReportSummary } from "./ReportSummary";
import { ReportImportDetails } from "./ReportImportDetails";
import { ReportFindingsSection } from "./ReportFindingsSection";
import { ReportDocumentsSection } from "./ReportDocumentsSection";
import { ReportQuestionsSection } from "./ReportQuestionsSection";
import { ReportDisclaimer } from "./ReportDisclaimer";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportPrintActions } from "./ReportPrintActions";
import { TaxSummaryReferenceCard } from "./TaxSummaryReferenceCard";
import { SaveReportPanel } from "@/components/persistence/SaveReportPanel";

export function ReportPreview() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  if (session === "loading") {
    return (
      <div className="upload-stack">
        <div className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  if (!session) {
    return <ReportEmptyState />;
  }

  const model = buildReportPreview(session);

  return (
    <div className="upload-stack">
      <div className="row-between print-hidden">
        <div>
          <p className="eyebrow">Навигация</p>
          <h2 style={{ margin: 0 }}>Структурированный предпросмотр</h2>
        </div>
        <Link
          href="/problems"
          className="btn"
          style={{ fontSize: "12px", opacity: 0.8 }}
        >
          Назад к проблемам
        </Link>
      </div>

      <ReportPrintActions report={model} />
      <SaveReportPanel session={session} report={model} />

      <div className="print-report-root">
        <ReportHeader fileName={model.fileName} savedAt={model.savedAt} />
        <ReportSummary
          readinessScore={model.readinessScore}
          readinessLabel={model.readinessLabel}
          riskSummary={model.riskSummary}
        />
        <ReportImportDetails parserSummary={model.parserSummary} />
        <ReportFindingsSection findings={model.findings} />
        <ReportDocumentsSection
          documentsNeeded={model.documentsNeeded}
          affectedRows={model.affectedRows}
          documentChecklist={model.documentChecklist}
        />
        <TaxSummaryReferenceCard />
        <ReportQuestionsSection questions={model.generatedQuestions} />
        <ReportDisclaimer disclaimer={model.disclaimer} />
      </div>
    </div>
  );
}
