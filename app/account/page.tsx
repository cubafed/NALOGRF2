import { AuthStatus } from "@/components/auth/AuthStatus";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";
import { AppShell } from "@/components/ui/AppShell";
import { DataPanel } from "@/components/ui/DataPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Аккаунт — Crypto Audit Report",
  description: "Optional Supabase auth foundation for future cloud persistence.",
};

export default function AccountPage() {
  const configured = isSupabaseConfigured();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Аккаунт"
        status={<StatusBadge status={configured ? "active" : "not_configured"} />}
        subtitle="Аккаунт нужен только для явного облачного сохранения. Локальный импорт, проблемы и предпросмотр отчета работают без входа."
        title="Аккаунт и облачное сохранение"
      />
      <div className="upload-stack">
        <DataPanel
          actions={<AuthStatus />}
          eyebrow="Состояние"
          title={configured ? "Облачное сохранение настроено" : "Облачное сохранение не настроено"}
        >
          {!configured && <SupabaseUnavailableNotice />}
        </DataPanel>
        {configured && <SignInPanel />}
      </div>
    </AppShell>
  );
}
