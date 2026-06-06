import { NoticeCard } from "@/components/ui/NoticeCard";

export function StorageUnavailableNotice() {
  return (
    <NoticeCard title="Загрузка файлов недоступна." variant="warning">
      <p className="muted">
        Загрузка файлов доступна только после настройки Supabase и входа в аккаунт.
        Локальный MVP продолжает работать без облачного хранения.
      </p>
    </NoticeCard>
  );
}
