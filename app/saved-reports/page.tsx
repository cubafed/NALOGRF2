"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { SavedReportsList } from "@/components/persistence/SavedReportsList";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { ActionLink } from "@/components/ui/ActionLink";
import { AppShell } from "@/components/ui/AppShell";
import { DataPanel } from "@/components/ui/DataPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createSupabaseSavedReportService } from "@/lib/persistence/saved-report-service.supabase";
import type { SavedReportRecord } from "@/lib/persistence/saved-report-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";

type SavedReportsState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "ready"; reports: SavedReportRecord[] };

export default function SavedReportsPage() {
  const [state, setState] = useState<SavedReportsState>(() => {
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

    async function loadReports() {
      const userResult = await supabaseClient.auth.getUser();

      if (!active) {
        return;
      }

      if (!userResult.data.user) {
        setState({ status: "signed_out" });
        return;
      }

      const service = createSupabaseSavedReportService(supabaseClient);
      const reports = await service.listReports();

      if (active) {
        setState({ status: "ready", reports });
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Сохраненные"
        status={<StatusBadge status={state.status === "ready" ? "active" : state.status === "unconfigured" ? "not_configured" : "loading"} />}
        subtitle="Список отчетов, сохраненных только после явного действия пользователя. Локальный MVP продолжает работать без облачного сохранения."
        title="Сохраненные отчеты"
      />

      <DataPanel actions={<AuthStatus />} eyebrow="Cloud persistence" title="Статус сохраненных отчетов">
        {state.status === "unconfigured" && <SupabaseUnavailableNotice />}

        {state.status === "loading" && (
          <p className="muted">Проверка аккаунта и доступных отчетов...</p>
        )}

        {state.status === "signed_out" && (
          <EmptyState
            description="Войдите в аккаунт, чтобы открыть облачные сохранения. Локальный импорт и предпросмотр отчета доступны без входа."
            primaryAction={<ActionLink href="/account" variant="primary">Открыть аккаунт</ActionLink>}
            secondaryAction={<ActionLink href="/upload" variant="ghost">Перейти к импорту</ActionLink>}
            title="Вход не выполнен"
          />
        )}

        {state.status === "ready" && <SavedReportsList reports={state.reports} />}
      </DataPanel>
    </AppShell>
  );
}
