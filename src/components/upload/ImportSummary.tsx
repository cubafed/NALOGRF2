import type { ParserSummary } from "@/lib/parsers/parser-types";
import { DataPanel } from "@/components/ui/DataPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const summaryItems: Array<[keyof ParserSummary, string]> = [
  ["totalRows", "Всего строк"],
  ["parsedRows", "Распознано строк"],
  ["warningRows", "Строк с предупреждениями"],
  ["errorRows", "Строк с ошибками"],
  ["transactionCount", "Транзакций"],
  ["warningCount", "Предупреждений"],
  ["errorCount", "Ошибок"],
];

export function ImportSummary({ summary }: { summary: ParserSummary }) {
  return (
    <DataPanel
      actions={<StatusBadge status="local" />}
      eyebrow="Сводка импорта"
      title="Результат импорта"
    >
        <div className="metric-grid">
          {summaryItems.map(([key, label]) => (
            <MetricCard key={key} label={label} value={summary[key]} />
          ))}
        </div>
    </DataPanel>
  );
}
