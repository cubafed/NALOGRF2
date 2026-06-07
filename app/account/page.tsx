import { AuthStatus } from "@/components/auth/AuthStatus";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { JurisdictionSelector } from "@/components/account/JurisdictionSelector";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Аккаунт — Crypto Audit Report",
  description: "Optional Supabase auth foundation for future cloud persistence.",
};

export default function AccountPage() {
  const configured = isSupabaseConfigured();

  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Account</p>
              <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                Аккаунт
              </h1>
              <p className="lead" style={{ marginTop: "14px" }}>
                Supabase auth foundation для будущего облачного сохранения. Локальный MVP
                продолжает работать без аккаунта.
              </p>
            </div>

            <div className="upload-stack">
              <section className="panel">
                <div className="panel-inner">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow" style={{ margin: 0 }}>Налоговый профиль</p>
                      <h2 style={{ margin: 0 }}>Юрисдикция</h2>
                    </div>
                  </div>
                  <p className="muted" style={{ margin: "8px 0 14px", fontSize: 13, maxWidth: 680 }}>
                    Определяет ставки и валюту предварительного расчёта. Хранится локально в
                    браузере. Результат всегда предварительный, для проверки с бухгалтером.
                  </p>
                  <JurisdictionSelector />
                </div>
              </section>
              <section className="panel">
                <div className="panel-inner">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Supabase state</p>
                      <h2 style={{ margin: 0 }}>
                        {configured ? "Supabase настроен" : "Supabase не настроен"}
                      </h2>
                    </div>
                    <AuthStatus />
                  </div>
                  {!configured && <SupabaseUnavailableNotice />}
                </div>
              </section>
              {configured && <SignInPanel />}
            </div>
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
