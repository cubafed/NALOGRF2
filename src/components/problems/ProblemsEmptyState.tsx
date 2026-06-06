import { ActionLink } from "@/components/ui/ActionLink";
import { EmptyState } from "@/components/ui/EmptyState";

export function ProblemsEmptyState() {
  return (
    <EmptyState
      eyebrow="Нет данных"
      description="Загрузите CSV или используйте sample CSV, чтобы продолжить и увидеть список проблем для проверки."
      primaryAction={<ActionLink href="/upload" variant="primary">Перейти к импорту</ActionLink>}
      title="Пока нет данных для проверки"
    />
  );
}
