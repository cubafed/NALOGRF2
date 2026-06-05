import type { Finding } from "@/lib/domain/types";

const severityLabel = {
  critical: "critical",
  medium: "medium",
  low: "low",
} as const;

export function FindingSummaryCard({ finding }: { finding: Finding }) {
  return (
    <article className="finding">
      <span className={`severity severity-${finding.severity}`}>
        {severityLabel[finding.severity]} · {finding.count}
      </span>
      <div>
        <h3 style={{ margin: "0 0 6px" }}>{finding.title}</h3>
        <p className="muted" style={{ margin: 0 }}>
          Rule ID: <strong>{finding.ruleId}</strong>
        </p>
      </div>
      <p style={{ margin: 0 }}>{finding.whatHappened}</p>
      <p className="muted" style={{ margin: 0 }}>
        {finding.recommendedAction}
      </p>
    </article>
  );
}
