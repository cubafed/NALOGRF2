"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { SavedReportsList } from "@/components/persistence/SavedReportsList";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
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
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Saved reports</p>
              <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                Сохраненные отчеты
              </h1>
              <p className="lead" style={{ marginTop: "14px" }}>
                Основа для будущего облачного сохранения. Локальный MVP продолжает
                работать без Supabase.
              </p>
            </div>

            <section className="panel">
              <div className="panel-inner">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Cloud persistence</p>
                    <h2 style={{ margin: 0 }}>Статус сохраненных отчетов</h2>
                  </div>
                  <AuthStatus />
                </div>

                {state.status === "unconfigured" && <SupabaseUnavailableNotice />}

                {state.status === "loading" && (
                  <p className="muted">Проверка аккаунта и доступных отчетов...</p>
                )}

                {state.status === "signed_out" && (
                  <div>
                    <p className="muted">
                      Войдите в аккаунт, чтобы использовать облачное сохранение.
                    </p>
                    <Link href="/account" className="btn btn-primary">
                      Открыть аккаунт
                    </Link>
                  </div>
                )}

                {state.status === "ready" && <SavedReportsList reports={state.reports} />}
              </div>
            </section>
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
