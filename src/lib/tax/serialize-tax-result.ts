import type { TaxEngineResult, DisposalLine } from "@/lib/tax/engine/engine-types";

const DISCLAIMER =
  "Расчёт предварительный и носит исключительно информационный характер. " +
  "Не является налоговой декларацией и не является официальной суммой к уплате. " +
  "Проверьте с бухгалтером или налоговым консультантом перед подачей декларации.";

function fmt(value: number | null, currency: string, fractions = 2): string {
  if (value === null) return "—";
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractions,
    }).format(value) +
    " " +
    currency
  );
}

function fmtQty(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(value);
}

function statusLabel(status: DisposalLine["status"]): string {
  if (status === "included") return "включено";
  if (status === "needs_review") return "требует проверки";
  return "исключено";
}

/**
 * Serialise a TaxEngineResult to a human-readable Markdown document.
 * Deterministic: given the same result, always produces the same text.
 */
export function serializeTaxResultText(result: TaxEngineResult, generatedAt?: string): string {
  const lines: string[] = [];
  const cur = result.reportCurrency;

  lines.push("# Предварительный налоговый расчёт");
  lines.push("");
  if (generatedAt) lines.push(`Сформировано: ${generatedAt}`);
  lines.push(`Юрисдикция: ${result.jurisdiction}`);
  lines.push(`Метод расчёта себестоимости: ${result.method}`);
  lines.push(`Валюта отчёта: ${cur}`);
  lines.push("");
  lines.push(`> ${DISCLAIMER}`);
  lines.push("");

  lines.push("## Итог");
  lines.push(`- Налоговая база: **${fmt(result.taxableBaseReport, cur)}**`);
  lines.push(`- Предварительный налог: **${fmt(result.taxAmountReport, cur)}**`);
  lines.push(
    `- Операций: ${result.includedCount} включено / ${result.needsReviewCount} требуют проверки / ${result.excludedCount} исключено`,
  );
  lines.push("");

  if (result.appliedBrackets.length > 0) {
    lines.push("## Расчёт по ставкам");
    for (const b of result.appliedBrackets) {
      lines.push(
        `- ${(b.rate * 100).toFixed(0)}%: база ${fmt(b.baseInBracket, cur)} → налог ${fmt(b.taxInBracket, cur)}`,
      );
    }
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("## Предупреждения");
    for (const w of result.warnings) {
      lines.push(`- ${w}`);
    }
    lines.push("");
  }

  lines.push("## Операции реализации");
  lines.push(
    "| Дата | Актив | Кол-во | Выручка | Себестоимость | Прибыль/убыток | Статус |",
  );
  lines.push("|---|---|---|---|---|---|---|");
  for (const d of result.disposals) {
    lines.push(
      `| ${d.date ?? "—"} | ${d.asset} | ${fmtQty(d.quantity)} | ${fmt(d.proceedsReport, cur)} | ${fmt(d.costBasisReport, cur)} | ${fmt(d.gainReport, cur)} | ${statusLabel(d.status)} |`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

/** Serialise to JSON for accountant tooling. */
export function serializeTaxResultJson(result: TaxEngineResult, generatedAt?: string): string {
  return JSON.stringify({ generatedAt: generatedAt ?? new Date().toISOString(), ...result }, null, 2);
}
