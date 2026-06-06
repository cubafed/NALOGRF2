import { ProblemsDashboard } from "@/components/problems/ProblemsDashboard";
import { AppShell } from "@/components/ui/AppShell";
import { ActionLink } from "@/components/ui/ActionLink";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Проблемы для проверки — Crypto Audit Report",
  description:
    "Список операций и пробелов в данных, которые могут потребовать пояснения для банка, бухгалтера или налогового консультанта.",
};

export default function ProblemsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Проблемы"
        primaryAction={<ActionLink href="/report" variant="primary">Сформировать отчет</ActionLink>}
        secondaryActions={<ActionLink href="/upload" variant="ghost">Вернуться к импорту</ActionLink>}
        subtitle="Список операций и пробелов в данных, которые могут потребовать пояснения для банка, бухгалтера или налогового консультанта."
        title="Проблемы для проверки"
      />
      <ProblemsDashboard />
    </AppShell>
  );
}
