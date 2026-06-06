import { ActionLink } from "@/components/ui/ActionLink";
import { EmptyState } from "@/components/ui/EmptyState";

export function ReportEmptyState() {
  return (
    <EmptyState
      eyebrow="Нет данных"
      description="Загрузите CSV или используйте sample CSV, чтобы сформировать предпросмотр отчета."
      primaryAction={<ActionLink href="/upload" variant="primary">Перейти к импорту</ActionLink>}
      title="Пока нет данных для предпросмотра"
    />
  );
}
