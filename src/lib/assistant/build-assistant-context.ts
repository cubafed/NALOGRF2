import type { AssistantContext, AssistantFindingSummary } from "@/lib/assistant/assistant-types";

/**
 * Group raw findings by ruleId into a compact summary for the advisor context.
 * Deterministic: preserves first-seen order; counts occurrences per rule.
 */
export function summarizeFindings(
  findings: ReadonlyArray<{ ruleId: string; severity: string; title: string }>,
): AssistantFindingSummary[] {
  const byRule = new Map<string, AssistantFindingSummary>();
  for (const f of findings) {
    const existing = byRule.get(f.ruleId);
    if (existing) {
      existing.count += 1;
    } else {
      byRule.set(f.ruleId, { ruleId: f.ruleId, title: f.title, severity: f.severity, count: 1 });
    }
  }
  return [...byRule.values()];
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value) + ` ${currency}`;
}

/**
 * Render a deterministic snapshot into a plain-text context block for the advisor.
 * Pure and deterministic: it only formats numbers already computed by the engine —
 * it never derives new figures. The advisor receives this as trusted context and is
 * instructed (see SYSTEM_PROMPT) to reference these numbers without recomputing them.
 */
export function buildAssistantContext(context: AssistantContext): string {
  const lines: string[] = [];
  lines.push("ДЕТЕРМИНИРОВАННЫЕ ДАННЫЕ (рассчитаны движком, не изменять):");

  if (context.periodLabel) {
    lines.push(`Период: ${context.periodLabel}`);
  }
  if (typeof context.readinessScore === "number") {
    lines.push(`Готовность к проверке: ${context.readinessScore}/100`);
  }

  if (context.tax) {
    const t = context.tax;
    lines.push("");
    lines.push("Предварительный налоговый расчёт:");
    lines.push(`- Налоговая база: ${formatMoney(t.taxableBaseReport, t.reportCurrency)}`);
    lines.push(`- Предварительная сумма налога: ${formatMoney(t.taxAmountReport, t.reportCurrency)}`);
    lines.push(`- Операций учтено: ${t.includedCount}`);
    lines.push(`- Требуют проверки: ${t.needsReviewCount}`);
  }

  lines.push("");
  if (context.findings.length === 0) {
    lines.push("Находок, требующих проверки, не выявлено.");
  } else {
    lines.push("Находки (для пояснения, не для выводов):");
    for (const f of context.findings) {
      lines.push(`- [${f.severity}] ${f.title} — ${f.count} шт.`);
    }
  }

  return lines.join("\n");
}
