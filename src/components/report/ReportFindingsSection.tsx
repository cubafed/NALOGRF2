import type { RiskFinding } from "@/lib/risk/risk-types";

interface ReportFindingsSectionProps {
  findings: RiskFinding[];
}

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Критично",
  medium: "Средне",
  low: "Низко",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "var(--red)",
  medium: "var(--amber)",
  low: "var(--muted)",
};

export function ReportFindingsSection({ findings }: ReportFindingsSectionProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Список проблем</p>
        <h2 style={{ margin: "0 0 16px" }}>Проблемы для проверки</h2>

        {findings.length === 0 ? (
          <p className="muted">
            Проблемы для проверки не найдены. Это не является налоговой, юридической, финансовой
            или AML-консультацией.
          </p>
        ) : (
          <div className="review-findings-grid">
            {findings.map((finding) => (
              <article className="finding" key={finding.id}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    className={`severity severity-${finding.severity}`}
                    style={{ color: SEVERITY_COLORS[finding.severity] }}
                  >
                    {SEVERITY_LABELS[finding.severity] ?? finding.severity}
                  </span>
                  <span className="muted" style={{ fontSize: "11px" }}>
                    {finding.ruleId}
                  </span>
                </div>

                <h3 style={{ margin: "8px 0 4px" }}>{finding.title}</h3>
                <p style={{ margin: "0 0 8px" }}>{finding.explanation}</p>

                <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
                  <strong>Почему это важно:</strong> {finding.whyItMatters}
                </p>
                <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
                  <strong>Что сделать:</strong> {finding.recommendedAction}
                </p>
                {finding.documentsNeeded.length > 0 && (
                  <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
                    <strong>Документы:</strong> {finding.documentsNeeded.join(", ")}
                  </p>
                )}
                {finding.affectedRawRowNumbers.length > 0 && (
                  <p className="muted" style={{ margin: "0 0 4px", fontSize: "12px" }}>
                    <strong>Затронутые строки:</strong>{" "}
                    {finding.affectedRawRowNumbers.join(", ")}
                  </p>
                )}
                {finding.affectedTransactionIds.length > 0 && (
                  <p className="muted" style={{ margin: 0, fontSize: "12px" }}>
                    <strong>ID транзакций:</strong>{" "}
                    {finding.affectedTransactionIds.slice(0, 5).join(", ")}
                    {finding.affectedTransactionIds.length > 5 &&
                      ` +${finding.affectedTransactionIds.length - 5} ещё`}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
