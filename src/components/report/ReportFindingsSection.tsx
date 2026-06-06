import type { RiskFinding } from "@/lib/risk/risk-types";
import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";

interface ReportFindingsSectionProps {
  findings: RiskFinding[];
}

const SEVERITY_ICONS = {
  critical: <AlertTriangle size={13} />,
  medium: <AlertCircle size={13} />,
  low: <Info size={13} />,
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Критично",
  medium: "Средне",
  low: "Низко",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "var(--red)",
  medium: "var(--amber)",
  low: "var(--blue)",
};

function ReportFindingCard({ finding }: { finding: RiskFinding }) {
  const color = SEVERITY_COLORS[finding.severity] ?? "var(--muted)";

  return (
    <article className="finding-v2">
      <span className={`finding-v2-stripe finding-v2-stripe-${finding.severity}`} />
      <div className="finding-v2-body">
        <div className="finding-v2-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color, flexShrink: 0 }}>
              {SEVERITY_ICONS[finding.severity as keyof typeof SEVERITY_ICONS] ?? <Info size={13} />}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color,
              }}
            >
              {SEVERITY_LABELS[finding.severity] ?? finding.severity}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{finding.ruleId}</span>
          </div>
        </div>

        <h3 className="finding-v2-title">{finding.title}</h3>
        <p className="finding-v2-meta" style={{ marginTop: 6, marginBottom: 8 }}>
          {finding.explanation}
        </p>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 8 }}>
          <p className="finding-v2-meta" style={{ marginBottom: 6 }}>
            <strong style={{ color: "var(--fg)" }}>Почему это важно:</strong>{" "}
            {finding.whyItMatters}
          </p>
          <p className="finding-v2-meta" style={{ marginBottom: finding.documentsNeeded.length > 0 ? 8 : 0 }}>
            <strong style={{ color: "var(--fg)" }}>Что сделать:</strong>{" "}
            {finding.recommendedAction}
          </p>

          {finding.documentsNeeded.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p className="finding-v2-meta" style={{ marginBottom: 4 }}>
                <strong style={{ color: "var(--fg)" }}>Документы:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {finding.documentsNeeded.map((d) => (
                  <li key={d} style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {finding.affectedRawRowNumbers.length > 0 && (
            <p className="finding-v2-meta" style={{ marginTop: 8 }}>
              <ChevronRight size={10} style={{ display: "inline", marginRight: 2 }} />
              Строки: {finding.affectedRawRowNumbers.join(", ")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ReportFindingsSection({ findings }: ReportFindingsSectionProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Список проблем</p>
        <h2 style={{ margin: "0 0 16px" }}>Проблемы для проверки</h2>

        {findings.length === 0 ? (
          <p className="muted">
            Проблемы для проверки не найдены. Не является налоговой, юридической, финансовой
            или AML-консультацией.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {findings.map((finding) => (
              <ReportFindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
