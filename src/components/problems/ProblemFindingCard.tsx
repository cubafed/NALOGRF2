"use client";

import { useState } from "react";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { DocumentsNeededList } from "./DocumentsNeededList";
import { AffectedRowsList } from "./AffectedRowsList";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

interface ProblemFindingCardProps {
  finding: RiskFinding;
}

function buildChecklist(finding: RiskFinding): string {
  const lines: string[] = [
    `Проблема: ${finding.title}`,
    `ruleId: ${finding.ruleId}`,
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
  const [copyError, setCopyError] = useState(false);

  const handleCopyChecklist = async () => {
    const text = buildChecklist(finding);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  return (
    <article
      className="finding"
      style={reviewed ? { opacity: 0.5 } : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SeverityBadge severity={finding.severity} />
          <span className="muted" style={{ fontSize: "11px" }}>
            ruleId: {finding.ruleId}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "11px", padding: "4px 10px" }}
            onClick={handleCopyChecklist}
          >
            {copied ? "Скопировано" : copyError ? "Нет доступа к буферу" : "Скопировать чеклист"}
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
            aria-label="Отметить как проверенное локально"
          >
            {reviewed ? "Снять отметку" : "Отметить как проверенное"}
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
