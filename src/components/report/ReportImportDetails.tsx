import type { ParserSummary } from "@/lib/parsers/parser-types";

interface ReportImportDetailsProps {
  parserSummary: ParserSummary;
}

export function ReportImportDetails({ parserSummary }: ReportImportDetailsProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Детали импорта</p>
        <h2 style={{ margin: "0 0 16px" }}>Технические данные парсинга</h2>
        <div className="metric-grid">
          <div className="metric">
            <span>Всего строк</span>
            <strong>{parserSummary.totalRows}</strong>
          </div>
          <div className="metric">
            <span>Транзакций распознано</span>
            <strong>{parserSummary.transactionCount}</strong>
          </div>
          <div className="metric">
            <span>Ошибки парсера</span>
            <strong style={{ color: parserSummary.errorCount > 0 ? "var(--red)" : undefined }}>
              {parserSummary.errorCount}
            </strong>
          </div>
          <div className="metric">
            <span>Предупреждения парсера</span>
            <strong style={{ color: parserSummary.warningCount > 0 ? "var(--amber)" : undefined }}>
              {parserSummary.warningCount}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
