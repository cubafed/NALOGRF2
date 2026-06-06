import { CsvUploadPanel } from "@/components/upload/CsvUploadPanel";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function UploadPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Импорт"
        status={<StatusBadge status="local" />}
        subtitle="Файл обрабатывается локально в браузере. Данные не сохраняются в облаке, пока вы явно не сохраните отчет."
        title="Загрузите CSV с операциями"
      />
      <CsvUploadPanel />
    </AppShell>
  );
}
