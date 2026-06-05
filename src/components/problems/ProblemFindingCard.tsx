"use client";

import { useState } from "react";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { DocumentsNeededList } from "./DocumentsNeededList";
import { AffectedRowsList } from "./AffectedRowsList";

interface ProblemFindingCardProps {
  finding: RiskFinding;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "var(--red)",
  medium: "var(--amber)",
  low: "var(--muted)",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Критично",
  medium: "Средне",
  low: "Низко",
};

function buildChecklist(finding: RiskFinding): string {
  const lines: string[] = [
    `Проблема: ${finding.title}`,
    `Rule ID: ${finding.ruleId}`,
    `Серьёзность: ${finding.severity}`,
    ``,
    `Описание: ${finding.explanation}`,
    ``,
    `Почему это важно: ${finding.whyItMatters}`,
    ``,
    `Что сделать: ${finding.recommendedAction}`,
  ];
  if (finding.documentsNeeded.length > 0) {
    lines.push(``, `Документы:`);
    finding.documentsNeeded.forEach((d) => lines.push(`  - ${d}`));
  }
  if (finding.affectedRawRowNumbers.length > 0) {
    lines.push(``, `Затронутые строки: ${finding.affectedRawRowNumbers.join(", ")}`);
  }
  return lines.join("\n");
}

export function ProblemFindingCard({ finding }: ProblemFindingCardProps) {
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyChecklist = () => {
    const text = buildChecklist(finding);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article
      className="finding"
      style={reviewed ? { opacity: 0.5 } : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "11px", padding: "4px 10px" }}
            onClick={handleCopyChecklist}
          >
            {copied ? "Скопировано" : "Скопировать checklist"}
          </button>
          <button
            type="button"
            className="btn"
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              opacity: 0.5,
              cursor: "default",
            }}
            onClick={() => setReviewed((v) => !v)}
            aria-label="Отметить как reviewed (локально)"
          >
            {reviewed ? "Снять отметку" : "Отметить как reviewed"}
          </button>
        </div>
      </div>

      <h3 style={{ margin: "8px 0 4px" }}>{finding.title}</h3>

      <p style={{ margin: "0 0 8px" }}>{finding.explanation}</p>

      <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
        <strong>Почему это важно:</strong> {finding.whyItMatters}
      </p>

      <p className="muted" style={{ margin: "0 0 10px", fontSize: "13px" }}>
        <strong>Что сделать:</strong> {finding.recommendedAction}
      </p>

      <DocumentsNeededList documents={finding.documentsNeeded} />

      <div style={{ marginTop: "8px" }}>
        <AffectedRowsList
          rowNumbers={finding.affectedRawRowNumbers}
          transactionIds={finding.affectedTransactionIds}
        />
      </div>
    </article>
  );
}
