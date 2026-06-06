import type { Transaction } from "@/lib/domain/types";
import type { ParserWarning, ParserError } from "@/lib/parsers/parser-types";
import type { SourceCoverageResult, SourceCoverageEntry } from "./analytics-types";

const UNKNOWN_SOURCE_LABEL = "Неизвестный источник";

export function calculateSourceCoverage(params: {
  transactions: Transaction[];
  parserWarnings: ParserWarning[];
  parserErrors: ParserError[];
}): SourceCoverageResult {
  const { transactions, parserWarnings, parserErrors } = params;
  const total = transactions.length;

  const countMap = new Map<string, number>();
  let unknownSourceCount = 0;

  for (const tx of transactions) {
    const src = tx.source && tx.source.trim() ? tx.source.trim() : null;
    if (!src) {
      unknownSourceCount++;
    }
    const key = src ?? UNKNOWN_SOURCE_LABEL;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  // Build warning/error count maps by row number → source label
  // We match warnings to source by looking at rawRow source field via transaction.rawRowNumber
  const rowToSource = new Map<number, string>();
  for (const tx of transactions) {
    if (tx.rawRowNumber !== undefined) {
      const src = tx.source && tx.source.trim() ? tx.source.trim() : UNKNOWN_SOURCE_LABEL;
      rowToSource.set(tx.rawRowNumber, src);
    }
  }

  const warnMap = new Map<string, number>();
  for (const w of parserWarnings) {
    const src = w.rowNumber !== undefined ? (rowToSource.get(w.rowNumber) ?? UNKNOWN_SOURCE_LABEL) : UNKNOWN_SOURCE_LABEL;
    warnMap.set(src, (warnMap.get(src) ?? 0) + 1);
  }

  const errMap = new Map<string, number>();
  for (const e of parserErrors) {
    const src = e.rowNumber !== undefined ? (rowToSource.get(e.rowNumber) ?? UNKNOWN_SOURCE_LABEL) : UNKNOWN_SOURCE_LABEL;
    errMap.set(src, (errMap.get(src) ?? 0) + 1);
  }

  const entries: SourceCoverageEntry[] = [];
  for (const [source, transactionCount] of countMap) {
    entries.push({
      source,
      transactionCount,
      warningCount: warnMap.get(source) ?? 0,
      errorCount: errMap.get(source) ?? 0,
      percent: total > 0 ? Math.round((transactionCount / total) * 100) : 0,
    });
  }

  entries.sort((a, b) => b.transactionCount - a.transactionCount);

  return { entries, unknownSourceCount };
}
