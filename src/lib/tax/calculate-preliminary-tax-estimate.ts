import type { Transaction } from "@/lib/domain/types";
import { buildTaxEstimateSummary } from "@/lib/tax/build-tax-estimate-summary";
import { classifyTaxEvent } from "@/lib/tax/classify-tax-event";
import type {
  ManualCostBasisByTransactionId,
  PreliminaryTaxEstimate,
  PreliminaryTaxEstimateLine,
} from "@/lib/tax/manual-cost-basis-types";
import type { TaxEventClassification } from "@/lib/tax/tax-event-types";

function parsePositiveNumber(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function displayCurrency(transaction: Transaction): string {
  return hasText(transaction.fiatCurrency) ? transaction.fiatCurrency.trim().toUpperCase() : "RUB";
}

function isP2pMarker(value: unknown): boolean {
  return typeof value === "string" && value.toLowerCase().includes("p2p");
}

function isSupportedManualCostBasisOperation(
  transaction: Transaction,
  classification: TaxEventClassification,
): boolean {
  if (transaction.type === "sell") {
    return true;
  }

  if (transaction.type === "p2p") {
    return true;
  }

  return (
    classification.category === "taxable_candidate" &&
    (isP2pMarker(transaction.source) ||
      isP2pMarker(transaction.originalType) ||
      isP2pMarker(transaction.notes) ||
      isP2pMarker(transaction.counterparty))
  );
}

function fiatFee(transaction: Transaction, fiatCurrency: string): number {
  const fee = parsePositiveNumber(transaction.feeAmount);
  if (fee === null) {
    return 0;
  }

  if (!hasText(transaction.feeAsset)) {
    return fee;
  }

  return transaction.feeAsset.trim().toUpperCase() === fiatCurrency ? fee : 0;
}

function findClassification(
  transaction: Transaction,
  classifications: readonly TaxEventClassification[],
): TaxEventClassification {
  return (
    classifications.find((classification) => classification.transactionId === transaction.id) ??
    classifyTaxEvent(transaction)
  );
}

function lineForUnsupported(
  transaction: Transaction,
  classification: TaxEventClassification,
): PreliminaryTaxEstimateLine {
  const fiatCurrency = displayCurrency(transaction);

  if (classification.category === "needs_review") {
    return {
      transactionId: transaction.id,
      rawRowId: classification.rawRowId,
      date: transaction.date,
      type: transaction.type,
      asset: transaction.asset,
      amount: transaction.amount,
      source: transaction.source,
      classificationCategory: classification.category,
      classificationReasonCode: classification.reasonCode,
      status: "needs_review",
      reasonCode: "classification_needs_review",
      explanation: classification.explanation,
      requiredData: classification.requiredData,
      fiatCurrency,
      proceedsFiat: parsePositiveNumber(transaction.fiatValue),
      manualCostBasisFiat: null,
      feeFiat: 0,
      preliminaryTaxableResultFiat: null,
      transaction,
      classification,
    };
  }

  return {
    transactionId: transaction.id,
    rawRowId: classification.rawRowId,
    date: transaction.date,
    type: transaction.type,
    asset: transaction.asset,
    amount: transaction.amount,
    source: transaction.source,
    classificationCategory: classification.category,
    classificationReasonCode: classification.reasonCode,
    status: "excluded",
    reasonCode:
      classification.category === "non_taxable_candidate"
        ? "non_taxable_operation"
        : classification.category === "excluded_from_estimate"
          ? "classification_excluded"
        : "unsupported_operation",
    explanation:
      classification.category === "non_taxable_candidate"
        ? "Operation is visible for review but is not a supported disposal in this preliminary estimate."
        : classification.explanation,
    requiredData: classification.requiredData,
    fiatCurrency,
    proceedsFiat: parsePositiveNumber(transaction.fiatValue),
    manualCostBasisFiat: null,
    feeFiat: 0,
    preliminaryTaxableResultFiat: null,
    transaction,
    classification,
  };
}

export function calculatePreliminaryTaxEstimate(
  transactions: readonly Transaction[],
  classifications: readonly TaxEventClassification[],
  manualCostBasis: ManualCostBasisByTransactionId,
): PreliminaryTaxEstimate {
  if (!Array.isArray(transactions)) {
    throw new TypeError("calculatePreliminaryTaxEstimate expects an array of transactions.");
  }

  if (!Array.isArray(classifications)) {
    throw new TypeError("calculatePreliminaryTaxEstimate expects an array of classifications.");
  }

  const lines = transactions.map((transaction): PreliminaryTaxEstimateLine => {
    const classification = findClassification(transaction, classifications);
    const fiatCurrency = displayCurrency(transaction);
    const proceedsFiat = parsePositiveNumber(transaction.fiatValue);
    const supported = isSupportedManualCostBasisOperation(transaction, classification);

    if (!supported) {
      return lineForUnsupported(transaction, classification);
    }

    if (proceedsFiat === null) {
      return {
        transactionId: transaction.id,
        rawRowId: classification.rawRowId,
        date: transaction.date,
        type: transaction.type,
        asset: transaction.asset,
        amount: transaction.amount,
        source: transaction.source,
        classificationCategory: classification.category,
        classificationReasonCode: classification.reasonCode,
        status: "needs_review",
        reasonCode: "missing_fiat_proceeds",
        explanation:
          "Fiat proceeds are missing, so this operation needs review before a preliminary estimate.",
        requiredData: ["fiat proceeds", "fiat currency", "manual cost basis"],
        fiatCurrency,
        proceedsFiat: null,
        manualCostBasisFiat: null,
        feeFiat: 0,
        preliminaryTaxableResultFiat: null,
        transaction,
        classification,
      };
    }

    const costBasisEntry = manualCostBasis[transaction.id];
    const manualCostBasisFiat = parsePositiveNumber(costBasisEntry?.costBasisFiat);

    if (manualCostBasisFiat === null) {
      return {
        transactionId: transaction.id,
        rawRowId: classification.rawRowId,
        date: transaction.date,
        type: transaction.type,
        asset: transaction.asset,
        amount: transaction.amount,
        source: transaction.source,
        classificationCategory: classification.category,
        classificationReasonCode: classification.reasonCode,
        status: "excluded",
        reasonCode: "missing_manual_cost_basis",
        explanation:
          "Manual cost basis is missing, so this operation is excluded from the preliminary estimate.",
        requiredData: ["manual cost basis"],
        fiatCurrency,
        proceedsFiat,
        manualCostBasisFiat: null,
        feeFiat: 0,
        preliminaryTaxableResultFiat: null,
        transaction,
        classification,
      };
    }

    const feeFiat = fiatFee(transaction, fiatCurrency);

    return {
      transactionId: transaction.id,
      rawRowId: classification.rawRowId,
      date: transaction.date,
      type: transaction.type,
      asset: transaction.asset,
      amount: transaction.amount,
      source: transaction.source,
      classificationCategory: classification.category,
      classificationReasonCode: classification.reasonCode,
      status: "included",
      reasonCode: "included_manual_cost_basis",
      explanation:
        "Operation is included using user-provided manual cost basis and available fiat proceeds.",
      requiredData: [],
      fiatCurrency,
      proceedsFiat,
      manualCostBasisFiat,
      feeFiat,
      preliminaryTaxableResultFiat: proceedsFiat - manualCostBasisFiat - feeFiat,
      transaction,
      classification,
    };
  });

  return {
    lines,
    summary: buildTaxEstimateSummary(lines),
  };
}
