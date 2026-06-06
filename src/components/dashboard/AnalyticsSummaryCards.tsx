import type { AnalyticsDashboardModel } from "@/lib/analytics/analytics-types";

interface AnalyticsSummaryCardsProps {
  dashboard: AnalyticsDashboardModel;
}

export function AnalyticsSummaryCards({ dashboard }: AnalyticsSummaryCardsProps) {
  const cards = [
    { label: "Всего операций", value: dashboard.transactionCount },
    { label: "Период", value: dashboard.period },
    { label: "Источники данных", value: dashboard.sourceCount },
    { label: "Готовность отчета", value: `${dashboard.readinessScore}/100` },
    { label: "Всего проблем", value: dashboard.riskSummary.totalFindings },
    { label: "Критичные проблемы", value: dashboard.findingsBySeverity.critical },
    { label: "Предупреждения импорта", value: dashboard.parserWarningCount },
    { label: "Ошибки импорта", value: dashboard.parserErrorCount },
  ];

  return (
    <section className="dashboard-summary-grid">
      {cards.map((card) => (
        <div className="metric" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </section>
  );
}
