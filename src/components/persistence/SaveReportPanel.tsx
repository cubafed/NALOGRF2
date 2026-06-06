"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ImportSession } from "@/lib/client/import-session-storage";
import { loadPartnerAttribution } from "@/lib/client/partner-attribution-storage";
import { serializeReportSession } from "@/lib/persistence/serialize-report-session";
import { createSupabaseSavedReportService } from "@/lib/persistence/saved-report-service.supabase";
import type { ReportPreviewModel } from "@/lib/report/report-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { SaveReportButton } from "@/components/persistence/SaveReportButton";
import { SavedReportStatus } from "@/components/persistence/SavedReportStatus";
import { DataPanel } from "@/components/ui/DataPanel";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SaveReportPanelProps {
  session: ImportSession;
  report: ReportPreviewModel;
}

type SavePanelAuthState = "unconfigured" | "loading" | "signed_out" | "signed_in";

export function SaveReportPanel({ session, report }: SaveReportPanelProps) {
  const [authState, setAuthState] = useState<SavePanelAuthState>(() => {
    return getSupabaseBrowserConfig().configured ? "loading" : "unconfigured";
  });
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const client = createSupabaseBrowserClient();

    if (!client) {
      setAuthState("unconfigured");
      return;
    }

    let active = true;

    client.auth.getUser().then((result) => {
      if (!active) {
        return;
      }

      setAuthState(result.data.user ? "signed_in" : "signed_out");
    });

    const subscription = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setAuthState(nextSession?.user ? "signed_in" : "signed_out");
    });

    return () => {
      active = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  if (authState === "unconfigured") {
    return (
      <DataPanel
        actions={<StatusBadge status="local" />}
        eyebrow="Сохранить отчет"
        printHidden
        title="Облачное сохранение"
      >
          <SupabaseUnavailableNotice />
      </DataPanel>
    );
  }

  if (authState === "loading") {
    return (
      <DataPanel printHidden>
        <p className="muted">Проверка состояния аккаунта...</p>
      </DataPanel>
    );
  }

  if (authState === "signed_out") {
    return (
      <DataPanel
        actions={
            <Link href="/account" className="btn btn-primary">
              Открыть аккаунт
            </Link>
        }
        eyebrow="Сохранить отчет"
        printHidden
        title="Нужен вход в аккаунт"
      >
        <NoticeCard variant="info">
          <p className="muted">
            Облачное сохранение доступно только после входа. Локальный предпросмотр
            отчета и печать PDF продолжают работать без аккаунта.
          </p>
        </NoticeCard>
      </DataPanel>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const draft = serializeReportSession({
      session,
      report,
      partnerAttribution: loadPartnerAttribution(),
    });
    const service = createSupabaseSavedReportService(createSupabaseBrowserClient());
    const result = await service.saveReport(draft);

    setIsSaving(false);
    setMessage(
      result.ok
        ? { text: "Отчет сохранен. Он появится на странице сохраненных отчетов.", tone: "success" }
        : { text: result.error, tone: "error" },
    );
  };

  return (
    <DataPanel
      actions={<SaveReportButton isSaving={isSaving} onSave={handleSave} />}
      eyebrow="Сохранить отчет"
      printHidden
      title="Облачное сохранение"
    >
        <p className="muted">
          Данные сохраняются только после явного действия пользователя. Raw CSV не
          загружается автоматически.
        </p>
        <SavedReportStatus message={message?.text ?? null} tone={message?.tone} />
    </DataPanel>
  );
}
