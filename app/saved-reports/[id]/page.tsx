"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SavedReportDetail } from "@/components/persistence/SavedReportDetail";
import { ReportFileUploadPanel } from "@/components/storage/ReportFileUploadPanel";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { ActionLink } from "@/components/ui/ActionLink";
import { AppShell } from "@/components/ui/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
    <AppShell>
      <PageHeader
        eyebrow="Сохраненный отчет"
        status={<StatusBadge status={state.status === "ready" ? "saved" : state.status === "unconfigured" ? "not_configured" : state.status === "missing" ? "unavailable" : "loading"} />}
        subtitle="Просмотр сохраненной записи без повторных расчетов и без автоматической загрузки raw CSV."
        title="Сохраненный отчет"
      />

      {state.status === "unconfigured" && <SupabaseUnavailableNotice />}
      {state.status === "loading" && (
        <section className="panel">
          <div className="panel-inner">
            <p className="muted">Загрузка сохраненного отчета...</p>
          </div>
        </section>
      )}
      {state.status === "signed_out" && (
        <EmptyState
          description="Войдите в аккаунт, чтобы открыть сохраненный отчет. Локальный импорт и предпросмотр остаются доступны без входа."
          primaryAction={<ActionLink href="/account" variant="primary">Открыть аккаунт</ActionLink>}
          secondaryAction={<ActionLink href="/saved-reports" variant="ghost">Назад к списку</ActionLink>}
          title="Вход не выполнен"
        />
      )}
      {state.status === "missing" && (
        <EmptyState
          description="Отчет не найден или недоступен текущему пользователю."
          primaryAction={<ActionLink href="/saved-reports" variant="secondary">Назад к списку</ActionLink>}
          title="Отчет недоступен"
        />
      )}
      {state.status === "ready" && (
        <>
          <SavedReportDetail report={state.report} />
          <ReportFileUploadPanel savedReportId={state.report.id} />
        </>
      )}
    </AppShell>
  );
}
