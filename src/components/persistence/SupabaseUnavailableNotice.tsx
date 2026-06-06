import { NoticeCard } from "@/components/ui/NoticeCard";

export function SupabaseUnavailableNotice() {
  return (
    <NoticeCard title="Облачное сохранение не настроено." variant="warning">
      <p className="muted">
        Облачное сохранение не настроено. Локальный MVP продолжает работать. Данные
        обрабатываются локально в браузере, пока вы явно не сохраните отчет.
      </p>
    </NoticeCard>
  );
}
