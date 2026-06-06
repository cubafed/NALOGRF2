import { ReportPreview } from "@/components/report/ReportPreview";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Предпросмотр отчета — Crypto Audit Report",
  description:
    "Структурированный предпросмотр отчета по источнику средств на основе локального импорта и проблем для проверки.",
};

export default function ReportPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Отчет"
        subtitle="Структурированный предпросмотр на основе последнего локального импорта и проблем для проверки. Помогает заранее подготовить пояснения и документы."
        title="Предпросмотр отчета"
      />
      <ReportPreview />
    </AppShell>
  );
}
