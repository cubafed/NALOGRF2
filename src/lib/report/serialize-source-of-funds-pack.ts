import type { SourceOfFundsPack } from "@/lib/report/source-of-funds-pack";

function formatMoney(value: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value) + ` ${currency}`
  );
}

/**
 * Serialize a source-of-funds package into a single human-readable document (Markdown).
 * Deterministic: no timestamps beyond `pack.generatedAt`, no environment access. Intended
 * as one document a user can hand to a bank or accountant to explain fund origin.
 */
export function serializeSourceOfFundsPackText(pack: SourceOfFundsPack): string {
  const lines: string[] = [];

  lines.push("# Пакет подтверждения источника средств");
  lines.push("");
  lines.push(`Период операций: ${pack.periodLabel}`);
  lines.push(`Сформировано: ${pack.generatedAt}`);
  lines.push("");
  lines.push(`> ${pack.disclaimer}`);
  lines.push("");

  lines.push("## Поступления по источникам");
  if (pack.inflowBySource.length === 0) {
    lines.push("Нет поступлений в загруженных данных.");
  } else {
    lines.push("Суммы показаны отдельно по каждой валюте и не суммируются между собой.");
    lines.push("");
    for (const inflow of pack.inflowBySource) {
      lines.push(
        `- ${inflow.source}: ${formatMoney(inflow.totalInflow, inflow.currency)} (${inflow.operationCount} оп.)`,
      );
    }
  }
  lines.push("");

  lines.push("## Может потребовать пояснения");
  if (pack.itemsThatMayNeedExplanation.length === 0) {
    lines.push("Пунктов, требующих пояснения, не выявлено.");
  } else {
    for (const item of pack.itemsThatMayNeedExplanation) {
      lines.push(`### ${item.title} (${item.operationCount} оп.)`);
      lines.push(item.whatMayNeedExplanation);
      lines.push(`Рекомендация: ${item.recommendedAction}`);
      if (item.documentsNeeded.length > 0) {
        lines.push(`Документы: ${item.documentsNeeded.join(", ")}`);
      }
      lines.push("");
    }
  }

  lines.push("## Документы для пакета");
  if (pack.documentChecklist.length === 0) {
    lines.push("Дополнительные документы по текущим находкам не указаны.");
  } else {
    for (const doc of pack.documentChecklist) {
      lines.push(`- [ ] ${doc.ru} (${doc.en})`);
    }
  }
  lines.push("");

  lines.push("## Черновики пояснительных писем");
  for (const template of pack.letterTemplates) {
    lines.push(`### ${template.title}`);
    lines.push(`_${template.appliesWhen}_`);
    lines.push("");
    lines.push(template.body);
    lines.push("");
  }

  return lines.join("\n");
}

/** Serialize the package to pretty JSON for an accountant's tooling. */
export function serializeSourceOfFundsPackJson(pack: SourceOfFundsPack): string {
  return JSON.stringify(pack, null, 2);
}
