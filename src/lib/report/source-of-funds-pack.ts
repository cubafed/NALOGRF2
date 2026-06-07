import type { Transaction, TransactionType } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { buildDocumentChecklist } from "@/lib/report/build-document-checklist";
import type { DocumentChecklistItem } from "@/lib/report/document-checklist-types";
import {
  buildBankCoverLetter,
  buildConcentratedCounterpartyLetter,
  buildCryptoIncomeLetter,
  buildGiftInheritanceLetter,
  buildLargeDisposalLetter,
  buildMiningStakingLetter,
  buildP2pNatureLetter,
  buildPersonalSavingsLetter,
  buildRapidTransitLetter,
  buildSourceOfFundsLetter,
  buildWalletOwnershipLetter,
  type ExplanationLetterTemplate,
  type LetterContext,
} from "@/lib/report/explanation-letter-templates";

/** Operation types that bring value in (consistent with the fiat-flow metric). */
const INFLOW_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>([
  "sell",
  "deposit",
  "p2p",
  "income",
]);

/** Disposal/realization types used for asset summary lines. */
const DISPOSAL_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>(["sell", "p2p"]);

/** Transaction types counted as income for mining/staking letter. */
const INCOME_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>(["income"]);

/** Risk rules whose findings are relevant to a source-of-funds explanation. */
const SOURCE_OF_FUNDS_RULE_IDS: ReadonlySet<string> = new Set([
  "large_p2p_inflow",
  "large_fiat_withdrawal",
  "unknown_source_wallet",
  "missing_cost_basis_basic",
  "rapid_transit",
  "concentrated_counterparty",
  "high_p2p_share",
]);

const UNKNOWN_SOURCE_LABEL = "Неизвестный источник";

export const SOURCE_OF_FUNDS_DISCLAIMER =
  "Пакет помогает легитимно подтвердить источник средств. Это не юридическая, налоговая или " +
  "финансовая консультация и не гарантия решения банка. Формулировки и документы проверьте " +
  "с бухгалтером или юристом.";

/** Per-(source, currency) inflow total. Monetary values are never summed across currencies. */
export interface SourceOfFundsInflow {
  source: string;
  currency: string;
  totalInflow: number;
  operationCount: number;
}

/** A finding rephrased as something that may require explanation to a bank/accountant. */
export interface SourceOfFundsExplanationItem {
  ruleId: string;
  title: string;
  whatMayNeedExplanation: string;
  recommendedAction: string;
  documentsNeeded: string[];
  operationCount: number;
}

/** Count of operations of one transaction type (for the operations summary). */
export interface OperationsSummaryByType {
  type: string;
  count: number;
}

/** Deterministic overview of the operations in the package (counts + inflow + period). */
export interface OperationsSummary {
  totalOperations: number;
  byType: OperationsSummaryByType[];
  inflowBySource: SourceOfFundsInflow[];
  periodLabel: string;
}

/**
 * One item in the package readiness checklist — tells the user what they have and what
 * is still missing before submitting the package to a bank or accountant.
 */
export interface PackReadinessItem {
  key: string;
  label: string;
  /** True when the item is already present in the generated pack. */
  present: boolean;
  /** Optional short note on what the user should do next. */
  hint?: string;
}

export interface SourceOfFundsPack {
  generatedAt: string;
  periodLabel: string;
  inflowBySource: SourceOfFundsInflow[];
  operationsSummary: OperationsSummary;
  itemsThatMayNeedExplanation: SourceOfFundsExplanationItem[];
  documentChecklist: DocumentChecklistItem[];
  letterTemplates: ExplanationLetterTemplate[];
  /** All letters available (including supplementary ones not tied to specific findings). */
  supplementaryLetters: ExplanationLetterTemplate[];
  /** Checklist of what is ready vs still needed for the bank package. */
  readiness: PackReadinessItem[];
  disclaimer: string;
}

export interface BuildSourceOfFundsPackOptions {
  generatedAt?: string;
}

function parseNumeric(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSource(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  return text.length === 0 ? UNKNOWN_SOURCE_LABEL : text;
}

function normalizeCurrency(value: string | undefined): string {
  const text = (value ?? "").trim().toUpperCase();
  return text.length === 0 ? "—" : text;
}

function derivePeriodLabel(transactions: readonly Transaction[]): string {
  const years = new Set<number>();
  for (const transaction of transactions) {
    const match = (transaction.date ?? transaction.timestamp ?? "").match(/^(\d{4})/);
    if (match) years.add(Number(match[1]));
  }
  if (years.size === 0) return "—";
  const sorted = [...years].sort((a, b) => a - b);
  return sorted.length === 1 ? `${sorted[0]}` : `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

function buildInflowBySource(transactions: readonly Transaction[]): SourceOfFundsInflow[] {
  const map = new Map<string, SourceOfFundsInflow>();

  for (const transaction of transactions) {
    if (!INFLOW_TYPES.has(transaction.type)) continue;
    const amount = parseNumeric(transaction.fiatValue);
    if (amount === null) continue;

    const source = normalizeSource(transaction.source);
    const currency = normalizeCurrency(transaction.fiatCurrency);
    const key = `${source}|${currency}`;

    const existing = map.get(key);
    if (existing) {
      existing.totalInflow += amount;
      existing.operationCount += 1;
    } else {
      map.set(key, { source, currency, totalInflow: amount, operationCount: 1 });
    }
  }

  return [...map.values()].sort(
    (a, b) => b.totalInflow - a.totalInflow || a.source.localeCompare(b.source, "ru"),
  );
}

function buildOperationsSummary(
  transactions: readonly Transaction[],
  inflowBySource: SourceOfFundsInflow[],
  periodLabel: string,
): OperationsSummary {
  const counts = new Map<string, number>();
  for (const transaction of transactions) {
    const type = (transaction.type ?? "unknown").trim() || "unknown";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const byType = [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

  return {
    totalOperations: transactions.length,
    byType,
    inflowBySource,
    periodLabel,
  };
}

/**
 * Build human-readable lines summarising realizations (sells/p2p) per asset.
 * Monetary totals are kept per-currency; never summed across currencies.
 */
function buildAssetSummaryLines(transactions: readonly Transaction[]): string[] {
  const byAsset = new Map<string, { count: number; currencies: Map<string, number> }>();
  for (const tx of transactions) {
    if (!DISPOSAL_TYPES.has(tx.type)) continue;
    const asset = tx.asset.trim().toUpperCase();
    const entry = byAsset.get(asset) ?? { count: 0, currencies: new Map() };
    entry.count += 1;
    const currency = normalizeCurrency(tx.fiatCurrency);
    const amount = parseNumeric(tx.fiatValue);
    if (amount !== null && currency !== "—") {
      entry.currencies.set(currency, (entry.currencies.get(currency) ?? 0) + amount);
    }
    byAsset.set(asset, entry);
  }

  const lines: string[] = [];
  for (const [asset, data] of [...byAsset.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const moneyParts = [...data.currencies.entries()].map(
      ([cur, total]) =>
        new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(total) + " " + cur,
    );
    const moneyStr = moneyParts.length > 0 ? " · " + moneyParts.join(", ") : "";
    lines.push(`${asset}: ${data.count} сделок реализации${moneyStr}`);
  }
  return lines;
}

/**
 * Build the readiness checklist: what is already in the pack, what still needs action.
 */
function buildReadiness(
  letterTemplates: ExplanationLetterTemplate[],
  supplementaryLetters: ExplanationLetterTemplate[],
  documentChecklist: DocumentChecklistItem[],
  itemsThatMayNeedExplanation: SourceOfFundsExplanationItem[],
): PackReadinessItem[] {
  const letterKeys = new Set([
    ...letterTemplates.map((t) => t.key),
    ...supplementaryLetters.map((t) => t.key),
  ]);
  const items: PackReadinessItem[] = [];

  items.push({
    key: "general_letter",
    label: "Пояснение об источнике средств (общее)",
    present: letterKeys.has("source_of_funds_general"),
    hint: "Всегда включается в пакет.",
  });

  items.push({
    key: "bank_cover",
    label: "Сопроводительное заявление в банк",
    present: letterKeys.has("bank_cover"),
    hint: letterKeys.has("bank_cover")
      ? undefined
      : "Появится автоматически, когда есть операции, требующие пояснения.",
  });

  items.push({
    key: "documents",
    label: `Документы для пакета (${documentChecklist.length})`,
    present: documentChecklist.length > 0,
    hint:
      documentChecklist.length > 0
        ? "Собраны по найденным признакам. Проверьте и приложите оригиналы."
        : "Дополнительные документы по текущим данным не требуются.",
  });

  if (itemsThatMayNeedExplanation.length > 0) {
    items.push({
      key: "explanation_items",
      label: `Пунктов, которые могут потребовать пояснения: ${itemsThatMayNeedExplanation.length}`,
      present: true,
      hint: "Для каждого подготовлено черновое письмо.",
    });
  }

  const supplementaryNeeded: { key: string; label: string }[] = [
    { key: "mining_staking_income", label: "Письмо по майнингу/стейкингу" },
    { key: "crypto_income", label: "Письмо по зарплате/оплате в крипте" },
    { key: "gift_inheritance", label: "Письмо по подарку/наследованию" },
    { key: "personal_savings", label: "Письмо по личным накоплениям" },
  ];
  for (const s of supplementaryNeeded) {
    if (!letterKeys.has(s.key)) {
      items.push({
        key: s.key,
        label: s.label,
        present: false,
        hint: "Доступно в разделе «Дополнительные письма».",
      });
    }
  }

  return items;
}

/**
 * Build a deterministic source-of-funds package from transactions and existing risk
 * findings. Reuses the document checklist and the deterministic risk findings — it does
 * not re-run any classification or invent figures. Pure and reproducible (timestamp is
 * injectable). It is legitimate documentation support for explaining fund origin to a
 * bank or accountant.
 */
export function buildSourceOfFundsPack(
  transactions: readonly Transaction[],
  findings: readonly RiskFinding[],
  options: BuildSourceOfFundsPackOptions = {},
): SourceOfFundsPack {
  if (!Array.isArray(transactions)) {
    throw new TypeError("buildSourceOfFundsPack expects an array of transactions.");
  }
  if (!Array.isArray(findings)) {
    throw new TypeError("buildSourceOfFundsPack expects an array of findings.");
  }

  const relevantFindings = findings.filter((finding) =>
    SOURCE_OF_FUNDS_RULE_IDS.has(finding.ruleId),
  );

  const itemsThatMayNeedExplanation: SourceOfFundsExplanationItem[] = relevantFindings.map(
    (finding) => ({
      ruleId: finding.ruleId,
      title: finding.title,
      whatMayNeedExplanation: finding.whyItMatters,
      recommendedAction: finding.recommendedAction,
      documentsNeeded: finding.documentsNeeded,
      operationCount: finding.affectedTransactionIds.length,
    }),
  );

  const inflowBySource = buildInflowBySource(transactions);
  const periodLabel = derivePeriodLabel(transactions);
  const assetSummaryLines = buildAssetSummaryLines(transactions);
  const incomeCount = transactions.filter((tx) => INCOME_TYPES.has(tx.type)).length;

  const hasRule = (ruleId: string) => relevantFindings.some((f) => f.ruleId === ruleId);
  const countForRule = (ruleId: string) =>
    relevantFindings
      .filter((f) => f.ruleId === ruleId)
      .reduce((sum, f) => sum + f.affectedTransactionIds.length, 0);

  const documentChecklist = buildDocumentChecklist(relevantFindings);

  const context: LetterContext = {
    periodLabel,
    sources: [...new Set(inflowBySource.map((inflow) => inflow.source))],
    inflowLines: inflowBySource.map(
      (inflow) =>
        `${inflow.source}: ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
          inflow.totalInflow,
        )} ${inflow.currency} (${inflow.operationCount} оп.)`,
    ),
    p2pCount: countForRule("large_p2p_inflow") + countForRule("high_p2p_share"),
    unknownSourceCount: countForRule("unknown_source_wallet"),
    largeDisposalCount: countForRule("large_fiat_withdrawal"),
    rapidTransitCount: countForRule("rapid_transit"),
    concentratedCounterpartyCount: countForRule("concentrated_counterparty"),
    attachedDocuments: documentChecklist.map((doc) => doc.ru),
    assetSummaryLines,
    incomeCount,
  };

  const letterTemplates: ExplanationLetterTemplate[] = [buildSourceOfFundsLetter(context)];
  // Cover letter is included whenever there is anything that may need explanation.
  if (itemsThatMayNeedExplanation.length > 0) letterTemplates.push(buildBankCoverLetter(context));
  if (hasRule("unknown_source_wallet")) letterTemplates.push(buildWalletOwnershipLetter(context));
  if (hasRule("large_p2p_inflow") || hasRule("high_p2p_share"))
    letterTemplates.push(buildP2pNatureLetter(context));
  if (hasRule("rapid_transit")) letterTemplates.push(buildRapidTransitLetter(context));
  if (hasRule("concentrated_counterparty"))
    letterTemplates.push(buildConcentratedCounterpartyLetter(context));
  if (hasRule("large_fiat_withdrawal")) letterTemplates.push(buildLargeDisposalLetter(context));

  // Supplementary letters: always available for user to use regardless of findings.
  const supplementaryLetters: ExplanationLetterTemplate[] = [
    buildMiningStakingLetter(context),
    buildCryptoIncomeLetter(context),
    buildGiftInheritanceLetter(context),
    buildPersonalSavingsLetter(context),
  ];

  const readiness = buildReadiness(
    letterTemplates,
    supplementaryLetters,
    documentChecklist,
    itemsThatMayNeedExplanation,
  );

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    periodLabel,
    inflowBySource,
    operationsSummary: buildOperationsSummary(transactions, inflowBySource, periodLabel),
    itemsThatMayNeedExplanation,
    documentChecklist,
    letterTemplates,
    supplementaryLetters,
    readiness,
    disclaimer: SOURCE_OF_FUNDS_DISCLAIMER,
  };
}
