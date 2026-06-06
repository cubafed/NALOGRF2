import type { ImportSession } from "@/lib/client/import-session-storage";
import type { AnalyticsCount, SourceCoverageMetrics } from "@/lib/analytics/analytics-types";

const missingSourceLabel = "Не указан";

function sourceLabel(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : missingSourceLabel;
}

function rawRowSource(session: ImportSession, rowNumber: number): string {
  const rawRow = session.rawRows.find((row) => row.rowNumber === rowNumber);
  return sourceLabel(rawRow?.normalized.source ?? rawRow?.raw.source);
}

export function calculateSourceCoverage(session: ImportSession): SourceCoverageMetrics {
  const sourceCounts = new Map<string, number>();

  session.transactions.forEach((transaction) => {
    const label = sourceLabel(transaction.source);
    sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
  });

  const transactionsBySource: AnalyticsCount[] = [...sourceCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  const uniqueSources = transactionsBySource
    .map((source) => source.label)
    .filter((label) => label !== missingSourceLabel)
    .sort((left, right) => left.localeCompare(right));

  const findingSourceCounts = new Map<string, number>();

  session.riskResult.findings.forEach((finding) => {
    finding.affectedRawRowNumbers.forEach((rowNumber) => {
      const label = rawRowSource(session, rowNumber);
      findingSourceCounts.set(label, (findingSourceCounts.get(label) ?? 0) + 1);
    });
  });

  const sourcesWithMostFindings: AnalyticsCount[] = [...findingSourceCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  return {
    sourceCount: uniqueSources.length,
    uniqueSources,
    transactionsBySource,
    sourcesWithMostFindings,
    note: "Этот MVP показывает источники из загруженного CSV. Специализированные парсеры бирж не реализованы в этом PR.",
  };
}
