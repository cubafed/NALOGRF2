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
      <section className="panel print-hidden">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Сохранить отчет</p>
              <h2 style={{ margin: 0 }}>Облачное сохранение</h2>
            </div>
            <span className="badge">Local MVP</span>
          </div>
          <SupabaseUnavailableNotice />
        </div>
      </section>
    );
  }

  if (authState === "loading") {
    return (
      <section className="panel print-hidden">
        <div className="panel-inner">
          <p className="muted">Проверка состояния аккаунта...</p>
        </div>
      </section>
    );
  }

  if (authState === "signed_out") {
    return (
      <section className="panel print-hidden">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Сохранить отчет</p>
              <h2 style={{ margin: 0 }}>Нужен вход в аккаунт</h2>
            </div>
            <Link href="/account" className="btn btn-primary">
              Открыть аккаунт
            </Link>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>
            Облачное сохранение доступно только после входа. Локальный report preview
            и печать PDF продолжают работать без аккаунта.
          </p>
        </div>
      </section>
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
    <section className="panel print-hidden">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Сохранить отчет</p>
            <h2 style={{ margin: 0 }}>Облачное сохранение</h2>
          </div>
          <SaveReportButton isSaving={isSaving} onSave={handleSave} />
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          Данные сохраняются только после явного действия пользователя. Raw CSV не
          загружается автоматически.
        </p>
        <SavedReportStatus message={message?.text ?? null} tone={message?.tone} />
      </div>
    </section>
  );
}
