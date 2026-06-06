import type { Transaction, TransactionType } from "@/lib/domain/types";
import type { RiskFinding } from "@/lib/risk/risk-types";
import { buildDocumentChecklist } from "@/lib/report/build-document-checklist";
import type { DocumentChecklistItem } from "@/lib/report/document-checklist-types";
import {
  buildLargeDisposalLetter,
  buildP2pNatureLetter,
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

/** Risk rules whose findings are relevant to a source-of-funds explanation. */
const SOURCE_OF_FUNDS_RULE_IDS: ReadonlySet<string> = new Set([
  "large_p2p_inflow",
  "large_fiat_withdrawal",
  "unknown_source_wallet",
  "missing_cost_basis_basic",
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

export interface SourceOfFundsPack {
  generatedAt: string;
  periodLabel: string;
  inflowBySource: SourceOfFundsInflow[];
  itemsThatMayNeedExplanation: SourceOfFundsExplanationItem[];
  documentChecklist: DocumentChecklistItem[];
  letterTemplates: ExplanationLetterTemplate[];
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

  const hasRule = (ruleId: string) => relevantFindings.some((f) => f.ruleId === ruleId);
  const countForRule = (ruleId: string) =>
    relevantFindings
      .filter((f) => f.ruleId === ruleId)
      .reduce((sum, f) => sum + f.affectedTransactionIds.length, 0);

  const context: LetterContext = {
    periodLabel,
    sources: [...new Set(inflowBySource.map((inflow) => inflow.source))],
    inflowLines: inflowBySource.map(
      (inflow) =>
        `${inflow.source}: ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
          inflow.totalInflow,
        )} ${inflow.currency} (${inflow.operationCount} оп.)`,
    ),
    p2pCount: countForRule("large_p2p_inflow"),
    unknownSourceCount: countForRule("unknown_source_wallet"),
    largeDisposalCount: countForRule("large_fiat_withdrawal"),
  };

  const letterTemplates: ExplanationLetterTemplate[] = [buildSourceOfFundsLetter(context)];
  if (hasRule("unknown_source_wallet")) letterTemplates.push(buildWalletOwnershipLetter(context));
  if (hasRule("large_p2p_inflow")) letterTemplates.push(buildP2pNatureLetter(context));
  if (hasRule("large_fiat_withdrawal")) letterTemplates.push(buildLargeDisposalLetter(context));

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    periodLabel,
    inflowBySource,
    itemsThatMayNeedExplanation,
    documentChecklist: buildDocumentChecklist(relevantFindings),
    letterTemplates,
    disclaimer: SOURCE_OF_FUNDS_DISCLAIMER,
  };
}
