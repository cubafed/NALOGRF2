"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { SavedReportDetail } from "@/components/persistence/SavedReportDetail";
import { ReportFileUploadPanel } from "@/components/storage/ReportFileUploadPanel";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { createSupabaseSavedReportService } from "@/lib/persistence/saved-report-service.supabase";
import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";

type DetailState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "missing" }
  | { status: "ready"; report: SavedReportRecord };

export default function SavedReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<DetailState>(() => {
    return getSupabaseBrowserConfig().configured
      ? { status: "loading" }
      : { status: "unconfigured" };
  });

  useEffect(() => {
    const client = createSupabaseBrowserClient();

    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    const supabaseClient = client;
    let active = true;

    async function loadReport() {
      const userResult = await supabaseClient.auth.getUser();

      if (!active) {
        return;
      }

      if (!userResult.data.user) {
        setState({ status: "signed_out" });
        return;
      }

      const service = createSupabaseSavedReportService(supabaseClient);
      const report = await service.getReport(params.id);

      if (!active) {
        return;
      }

      setState(report ? { status: "ready", report } : { status: "missing" });
    }

    loadReport();

    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Saved report detail</p>
              <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                Сохраненный отчет
              </h1>
              <p className="lead" style={{ marginTop: "14px" }}>
                Просмотр сохраненной записи из Supabase без повторных расчетов и без
                загрузки raw CSV.
              </p>
            </div>

            {state.status === "unconfigured" && <SupabaseUnavailableNotice />}
            {state.status === "loading" && (
              <section className="panel">
                <div className="panel-inner">
                  <p className="muted">Загрузка сохраненного отчета...</p>
                </div>
              </section>
            )}
            {state.status === "signed_out" && (
              <section className="panel">
                <div className="panel-inner">
                  <p className="muted">Войдите в аккаунт, чтобы открыть сохраненный отчет.</p>
                  <Link href="/account" className="btn btn-primary">
                    Открыть аккаунт
                  </Link>
                </div>
              </section>
            )}
            {state.status === "missing" && (
              <section className="panel">
                <div className="panel-inner">
                  <p className="muted">Отчет не найден или недоступен текущему пользователю.</p>
                  <Link href="/saved-reports" className="btn btn-secondary">
                    Назад к списку
                  </Link>
                </div>
              </section>
            )}
            {state.status === "ready" && (
              <>
                <SavedReportDetail report={state.report} />
                <ReportFileUploadPanel savedReportId={state.report.id} />
              </>
            )}
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
