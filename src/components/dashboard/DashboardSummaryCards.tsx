import type { AnalyticsSummaryMetrics } from "@/lib/metrics/analytics-types";

interface DashboardSummaryCardsProps {
  summary: AnalyticsSummaryMetrics;
}

const summaryItems: Array<{
  label: string;
  value: (summary: AnalyticsSummaryMetrics) => string | number;
}> = [
  { label: "Total operations", value: (summary) => summary.totalOperations },
  { label: "Parsed transactions", value: (summary) => summary.parsedTransactions },
  { label: "Parser errors", value: (summary) => summary.parserErrors },
  { label: "Parser warnings", value: (summary) => summary.parserWarnings },
  { label: "Readiness score", value: (summary) => `${summary.readinessScore}/100` },
  { label: "Total findings", value: (summary) => summary.totalFindings },
  { label: "Critical findings", value: (summary) => summary.criticalFindings },
  { label: "Medium findings", value: (summary) => summary.mediumFindings },
  { label: "Low findings", value: (summary) => summary.lowFindings },
  { label: "Unique assets", value: (summary) => summary.uniqueAssets },
  { label: "Unique sources", value: (summary) => summary.uniqueSources },
];

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <section className="dashboard-summary-grid">
      {summaryItems.map((item) => (
        <div className="metric" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value(summary)}</strong>
        </div>
      ))}
    </section>
  );
}
