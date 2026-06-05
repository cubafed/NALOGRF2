import type { FindingSeverity, Transaction } from "@/lib/domain/types";
import type { RiskFinding, RiskRule } from "@/lib/risk/risk-types";

const acquisitionTypes = new Set(["buy", "deposit", "income", "transfer"]);

export const riskRules: RiskRule[] = [
  missingFiatValueRule,
  largeP2pInflowRule,
  largeFiatWithdrawalRule,
  unknownSourceWalletRule,
  unknownTransactionTypeRule,
  missingCostBasisBasicRule,
];

function missingFiatValueRule({ transactions }: Parameters<RiskRule>[0]): RiskFinding[] {
  const affected = transactions.filter((transaction) => isMissing(transaction.fiatValue));
  if (affected.length === 0) return [];

  return [
    makeFinding({
      id: "risk-missing_fiat_value",
      ruleId: "missing_fiat_value",
      severity: "medium",
      title: "Не указана fiat-стоимость операции",
      explanation: "В части операций отсутствует fiat-стоимость.",
      whyItMatters:
        "Бухгалтеру или налоговому консультанту может понадобиться стоимость операции в валюте учета.",
      recommendedAction:
        "Добавьте fiat-стоимость операции или загрузите выгрузку биржи с ценой сделки.",
      documentsNeeded: ["exchange trade history", "price source", "accountant note"],
      affected,
    }),
  ];
}

function largeP2pInflowRule({ transactions, options }: Parameters<RiskRule>[0]): RiskFinding[] {
  const affected = transactions.filter((transaction) => {
    if (transaction.type !== "p2p") return false;
    const value = numericValue(transaction.fiatValue) ?? numericValue(transaction.amount);
    return value !== null && value >= options.largeP2pInflowThreshold;
  });
  if (affected.length === 0) return [];

  const maxValue = Math.max(
    ...affected.map((transaction) => numericValue(transaction.fiatValue) ?? numericValue(transaction.amount) ?? 0),
  );
  const severity: FindingSeverity =
    maxValue >= options.criticalP2pInflowThreshold ? "critical" : "medium";

  return [
    makeFinding({
      id: "risk-large_p2p_inflow",
      ruleId: "large_p2p_inflow",
      severity,
      title: "Крупная P2P-операция требует проверки",
      explanation: "В истории есть P2P-операции выше порога review.",
      whyItMatters:
        "Банк или бухгалтер может запросить подтверждение происхождения средств по крупным P2P-операциям.",
      recommendedAction:
        "Сохраните подтверждение P2P-сделки, банковскую выписку и историю операций биржи.",
      documentsNeeded: ["P2P order proof", "bank statement", "exchange statement"],
      affected,
    }),
  ];
}

function largeFiatWithdrawalRule({ transactions, options }: Parameters<RiskRule>[0]): RiskFinding[] {
  const affected = transactions.filter((transaction) => {
    if (transaction.type !== "withdrawal" && transaction.type !== "sell") return false;
    const value = numericValue(transaction.fiatValue);
    return value !== null && value >= options.largeFiatWithdrawalThreshold;
  });
  if (affected.length === 0) return [];

  const maxValue = Math.max(...affected.map((transaction) => numericValue(transaction.fiatValue) ?? 0));
  const severity: FindingSeverity =
    maxValue >= options.criticalFiatWithdrawalThreshold ? "critical" : "medium";

  return [
    makeFinding({
      id: "risk-large_fiat_withdrawal",
      ruleId: "large_fiat_withdrawal",
      severity,
      title: "Крупный вывод или продажа в fiat",
      explanation: "В истории есть крупные выводы или продажи в fiat.",
      whyItMatters: "Крупные выводы или продажи могут потребовать объяснения источника средств.",
      recommendedAction: "Подготовьте историю покупки актива, сделку продажи и банковскую выписку.",
      documentsNeeded: ["sell order", "withdrawal record", "bank statement", "acquisition history"],
      affected,
    }),
  ];
}

function unknownSourceWalletRule({ transactions }: Parameters<RiskRule>[0]): RiskFinding[] {
  const affected = transactions.filter((transaction) => {
    if (transaction.type !== "deposit") return false;
    const counterparty = normalizedText(transaction.counterparty);
    const source = normalizedText(transaction.source);
    const combined = `${counterparty} ${source}`.trim();
    if (combined === "") return true;
    return (
      combined.includes("unknown") ||
      combined.includes("external wallet") ||
      combined.includes("external")
    );
  });
  if (affected.length === 0) return [];

  return [
    makeFinding({
      id: "risk-unknown_source_wallet",
      ruleId: "unknown_source_wallet",
      severity: "medium",
      title: "Поступление из неизвестного источника",
      explanation: "В истории есть deposit-операции, источник которых неочевиден.",
      whyItMatters: "Источник поступления неочевиден из загруженной истории.",
      recommendedAction:
        "Добавьте пояснение, кому принадлежит кошелек, и приложите transaction hash или историю кошелька.",
      documentsNeeded: ["wallet ownership note", "blockchain transaction link", "prior exchange withdrawal"],
      affected,
    }),
  ];
}

function unknownTransactionTypeRule({ transactions }: Parameters<RiskRule>[0]): RiskFinding[] {
  const affected = transactions.filter((transaction) => transaction.type === "unknown");
  if (affected.length === 0) return [];

  return [
    makeFinding({
      id: "risk-unknown_transaction_type",
      ruleId: "unknown_transaction_type",
      severity: "low",
      title: "Неизвестный тип операции",
      explanation: "Операция была импортирована, но ее тип не распознан.",
      whyItMatters:
        "Операция была импортирована, но ее тип не распознан. Это может повлиять на полноту отчета.",
      recommendedAction: "Проверьте операцию вручную и при необходимости задайте корректный тип.",
      documentsNeeded: ["source row", "exchange statement", "manual classification note"],
      affected,
    }),
  ];
}

function missingCostBasisBasicRule({ transactions }: Parameters<RiskRule>[0]): RiskFinding[] {
  const orderedTransactions = [...transactions].sort(compareTransactionOrder);
  const seenAcquisitions = new Set<string>();
  const affected: Transaction[] = [];

  for (const transaction of orderedTransactions) {
    const asset = transaction.asset.toUpperCase();
    if (acquisitionTypes.has(transaction.type)) {
      seenAcquisitions.add(asset);
      continue;
    }
    if ((transaction.type === "sell" || transaction.type === "conversion") && !seenAcquisitions.has(asset)) {
      affected.push(transaction);
    }
  }

  if (affected.length === 0) return [];

  const assetPart = [...new Set(affected.map((transaction) => transaction.asset.toUpperCase()))].join("-");
  const firstRawRow = affected[0]?.rawRowNumber ?? "unknown";

  return [
    makeFinding({
      id: `risk-missing_cost_basis_basic-${assetPart}-${firstRawRow}`,
      ruleId: "missing_cost_basis_basic",
      severity: "critical",
      title: "Не найдена история приобретения актива",
      explanation:
        "Найдены продажи или conversion-операции без более ранней покупки, поступления, income или transfer по тому же активу.",
      whyItMatters:
        "Для расчета результата продажи может понадобиться цена и дата приобретения актива.",
      recommendedAction:
        "Загрузите более раннюю историю операций или добавьте запись о покупке/получении актива.",
      documentsNeeded: ["earlier exchange history", "acquisition record", "wallet deposit history"],
      affected,
    }),
  ];
}

function makeFinding(input: {
  id: string;
  ruleId: string;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendedAction: string;
  documentsNeeded: string[];
  affected: readonly Transaction[];
}): RiskFinding {
  return {
    id: input.id,
    ruleId: input.ruleId,
    severity: input.severity,
    title: input.title,
    explanation: input.explanation,
    whyItMatters: input.whyItMatters,
    recommendedAction: input.recommendedAction,
    documentsNeeded: input.documentsNeeded,
    affectedTransactionIds: input.affected.map((transaction) => transaction.id),
    affectedRawRowNumbers: input.affected
      .map((transaction) => transaction.rawRowNumber)
      .filter((rowNumber): rowNumber is number => rowNumber !== undefined),
    status: "open",
    createdBy: "risk_engine_v1",
  };
}

function numericValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isMissing(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

function normalizedText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function compareTransactionOrder(left: Transaction, right: Transaction): number {
  const leftTime = timeValue(left.timestamp ?? left.date);
  const rightTime = timeValue(right.timestamp ?? right.date);
  if (leftTime !== rightTime) return leftTime - rightTime;
  return (left.rawRowNumber ?? 0) - (right.rawRowNumber ?? 0);
}

function timeValue(value: string | undefined): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}
