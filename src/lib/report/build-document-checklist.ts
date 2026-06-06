import type { RiskFinding } from "@/lib/risk/risk-types";
import type { FindingSeverity } from "@/lib/domain/types";
import { resolveDocument } from "./document-catalog";
import type { DocumentChecklistItem, DocumentPriority } from "./document-checklist-types";

const severityOrder: Record<FindingSeverity, number> = {
  critical: 0,
  medium: 1,
  low: 2,
};

export function buildDocumentChecklist(
  findings: readonly RiskFinding[],
): DocumentChecklistItem[] {
  const itemMap = new Map<
    string,
    {
      entry: ReturnType<typeof resolveDocument>;
      priority: FindingSeverity;
      findingIds: Set<string>;
      rowNumbers: Set<number>;
      rawTokens: Set<string>;
    }
  >();

  for (const finding of findings) {
    for (const token of finding.documentsNeeded) {
      const entry = resolveDocument(token);

      const existing = itemMap.get(entry.key);
      if (existing) {
        if (severityOrder[finding.severity] < severityOrder[existing.priority]) {
          existing.priority = finding.severity;
        }
        existing.findingIds.add(finding.id);
        for (const row of finding.affectedRawRowNumbers) {
          existing.rowNumbers.add(row);
        }
        existing.rawTokens.add(token);
      } else {
        itemMap.set(entry.key, {
          entry,
          priority: finding.severity,
          findingIds: new Set([finding.id]),
          rowNumbers: new Set(finding.affectedRawRowNumbers),
          rawTokens: new Set([token]),
        });
      }
    }
  }

  const items: DocumentChecklistItem[] = Array.from(itemMap.values()).map(
    ({ entry, priority, findingIds, rowNumbers, rawTokens }) => ({
      key: entry.key,
      ru: entry.ru,
      en: entry.en,
      description: entry.description,
      category: entry.category,
      priority: priority as DocumentPriority,
      requiredByFindingIds: Array.from(findingIds),
      affectedRawRowNumbers: Array.from(rowNumbers).sort((a, b) => a - b),
      rawTokens: Array.from(rawTokens),
    }),
  );

  items.sort((a, b) => {
    const orderDiff = severityOrder[a.priority] - severityOrder[b.priority];
    if (orderDiff !== 0) return orderDiff;
    return a.ru.localeCompare(b.ru, "ru");
  });

  return items;
}
