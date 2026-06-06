import type { ImportSession } from "@/lib/client/import-session-storage";
import type { SourceCoverageMetrics } from "@/lib/metrics/analytics-types";

function sourceLabel(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : "Не указан";
}

export function calculateSourceCoverage(session: ImportSession): SourceCoverageMetrics {
  const sourceCounts = new Map<string, number>();

  session.transactions.forEach((transaction) => {
    const label = sourceLabel(transaction.source);
    sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
  });

  const transactionsPerSource = [...sourceCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  const sourcesWithIssues = new Set<string>();
  const issueRows = new Set(
    [...session.parserErrors, ...session.parserWarnings]
      .map((issue) => issue.rowNumber)
      .filter((rowNumber): rowNumber is number => typeof rowNumber === "number"),
  );

  session.rawRows.forEach((row) => {
    if (row.status === "ok" && !issueRows.has(row.rowNumber)) {
      return;
    }

    sourcesWithIssues.add(sourceLabel(row.normalized.source ?? row.raw.source));
  });

  const hasSources = transactionsPerSource.some((source) => source.label !== "Не указан");
  const hasIssues = sourcesWithIssues.size > 0 || sourceCounts.has("Не указан");

  return {
    uniqueSources: transactionsPerSource.filter((source) => source.label !== "Не указан").length,
    transactionsPerSource,
    topSources: transactionsPerSource.slice(0, 5),
    sourcesWithIssues: [...sourcesWithIssues].sort((left, right) => left.localeCompare(right)),
    status: hasSources ? (hasIssues ? "Требует проверки" : "Есть данные") : "Нет данных",
  };
}
