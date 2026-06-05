import type { ParserSummary } from "@/lib/parsers/parser-types";

const summaryItems: Array<[keyof ParserSummary, string]> = [
  ["totalRows", "Всего строк"],
  ["parsedRows", "Строк parsed"],
  ["warningRows", "Строк с warnings"],
  ["errorRows", "Строк с errors"],
  ["transactionCount", "Транзакций"],
  ["warningCount", "Warnings"],
  ["errorCount", "Errors"],
];

export function ImportSummary({ summary }: { summary: ParserSummary }) {
  return (
    <section className="panel" aria-label="Import summary">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Import summary</p>
            <h2 style={{ margin: 0 }}>Результат импорта</h2>
          </div>
          <span className="badge">Local parse</span>
        </div>
        <div className="metric-grid">
          {summaryItems.map(([key, label]) => (
            <div className="metric" key={key}>
              <span>{label}</span>
              <strong>{summary[key]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
