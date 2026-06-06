"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, ChevronUp, ClipboardCopy, Check } from "lucide-react";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { DocumentsNeededList } from "./DocumentsNeededList";
import { AffectedRowsList } from "./AffectedRowsList";

interface ProblemFindingCardProps {
  finding: RiskFinding;
}

const SEVERITY_ICONS = {
  critical: <AlertTriangle size={14} />,
  medium: <AlertCircle size={14} />,
  low: <Info size={14} />,
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
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = buildChecklist(finding);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const color = SEVERITY_COLORS[finding.severity] ?? "var(--muted)";

  return (
    <motion.article
      className={`finding-v2${reviewed ? " finding-v2--reviewed" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: reviewed ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Left severity stripe */}
      <span className={`finding-v2-stripe finding-v2-stripe-${finding.severity}`} />

      <div className="finding-v2-body">
        {/* Header row */}
        <div className="finding-v2-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ color, flexShrink: 0 }}>
              {SEVERITY_ICONS[finding.severity as keyof typeof SEVERITY_ICONS] ?? <Info size={14} />}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color,
                flexShrink: 0,
              }}
            >
              {SEVERITY_LABELS[finding.severity] ?? finding.severity}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
              {finding.ruleId}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleCopy}
              title="Скопировать"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: copied ? "var(--green)" : "var(--muted)",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                transition: "color var(--t-fast)",
              }}
            >
              {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
            </button>

            <button
              type="button"
              onClick={() => setReviewed((v) => !v)}
              title={reviewed ? "Снять отметку" : "Отметить как проверено"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: reviewed ? "var(--green)" : "var(--muted)",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                transition: "color var(--t-fast)",
              }}
            >
              <CheckCircle2 size={14} />
            </button>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                transition: "color var(--t-fast)",
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="finding-v2-title"
          style={reviewed ? { textDecoration: "line-through", opacity: 0.6 } : undefined}
        >
          {finding.title}
        </h3>

        {/* Summary always visible */}
        <p className="finding-v2-meta" style={{ marginTop: 6 }}>
          {finding.explanation}
        </p>

        {/* Collapsible detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: 12, borderTop: "1px solid var(--line)", marginTop: 12 }}>
                <p className="finding-v2-meta" style={{ marginBottom: 6 }}>
                  <strong style={{ color: "var(--fg)" }}>Почему это важно:</strong>{" "}
                  {finding.whyItMatters}
                </p>
                <p className="finding-v2-meta" style={{ marginBottom: 10 }}>
                  <strong style={{ color: "var(--fg)" }}>Что сделать:</strong>{" "}
                  {finding.recommendedAction}
                </p>

                <DocumentsNeededList documents={finding.documentsNeeded} />

                <div style={{ marginTop: 8 }}>
                  <AffectedRowsList
                    rowNumbers={finding.affectedRawRowNumbers}
                    transactionIds={finding.affectedTransactionIds}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              marginTop: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--blue)",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Подробнее <ChevronDown size={12} />
          </button>
        )}
      </div>
    </motion.article>
  );
}
