import type { Transaction, TransactionType } from "@/lib/domain/types";
import { buildAcquisitionLots } from "@/lib/tax/lots/build-lots";
import { convertToReport } from "@/lib/tax/rates/convert";
import { fifoMethod } from "@/lib/tax/methods/fifo";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";
import type {
  CostBasisMethod,
  JurisdictionModule,
  RateLookup,
  TaxEngineResult,
} from "@/lib/tax/engine/engine-types";

/** Operation types treated as taxable disposals in the engine. */
const DISPOSAL_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>(["sell", "p2p"]);

function parsePositive(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function transactionDate(transaction: Transaction): string | undefined {
  return transaction.date ?? transaction.timestamp;
}

function isDisposal(transaction: Transaction): boolean {
  return DISPOSAL_TYPES.has(transaction.type);
}

export interface CalculateTaxOptions {
  transactions: readonly Transaction[];
  rates: RateLookup;
  jurisdiction: JurisdictionModule;
  /** Defaults to FIFO. */
  method?: CostBasisMethod;
  manualCostBasis?: ManualCostBasisByTransactionId;
}

/**
 * Deterministic tax engine: build acquisition lots, match disposals by the chosen
 * cost-basis method, convert every leg to the jurisdiction's report currency, and apply
 * the jurisdiction's progressive rate. The output is a PRELIMINARY figure for review with
 * an accountant — never an official amount due. Missing rates/cost/coverage yield
 * `needs_review`, never a guessed number.
 */
export function calculateTax({
  transactions,
  rates,
  jurisdiction,
  method = fifoMethod,
  manualCostBasis = {},
}: CalculateTaxOptions): TaxEngineResult {
  if (!Array.isArray(transactions)) {
    throw new TypeError("calculateTax expects an array of transactions.");
  }
  if (rates.reportCurrency !== jurisdiction.reportCurrency) {
    throw new Error(
      `Rate lookup report currency (${rates.reportCurrency}) does not match jurisdiction (${jurisdiction.reportCurrency}).`,
    );
  }

  const warnings: string[] = [];

  const lots = buildAcquisitionLots(transactions, rates, manualCostBasis);

  const disposals = transactions.filter(isDisposal).map((transaction) => {
    const date = transactionDate(transaction);
    const quantity = parsePositive(transaction.amount) ?? 0;
    const proceedsReport = convertToReport(
      parsePositive(transaction.fiatValue),
      transaction.fiatCurrency,
      date,
      rates,
    );
    // Fees are only valued when we can convert them (fiat fee or report currency).
    // A crypto-denominated fee needs a price (Phase 2) and is treated as 0 here.
    const feeReport =
      convertToReport(parsePositive(transaction.feeAmount), transaction.feeAsset, date, rates) ?? 0;

    return { transaction, asset: (transaction.asset ?? "").trim().toUpperCase(), date, quantity, proceedsReport, feeReport };
  });

  const lines = method.matchDisposals({ lots, disposals });

  let taxableBaseReport = 0;
  let includedCount = 0;
  let needsReviewCount = 0;
  let excludedCount = 0;

  for (const line of lines) {
    if (line.status === "included" && line.gainReport !== null) {
      taxableBaseReport += line.gainReport;
      includedCount += 1;
    } else if (line.status === "needs_review") {
      needsReviewCount += 1;
    } else {
      excludedCount += 1;
    }
  }

  if (needsReviewCount > 0) {
    warnings.push(
      `${needsReviewCount} операц. требуют проверки (нет курса, себестоимости или покрытия) и не вошли в предварительный расчёт.`,
    );
  }

  const { taxAmountReport, appliedBrackets } = jurisdiction.computeTax(taxableBaseReport);

  return {
    jurisdiction: jurisdiction.code,
    reportCurrency: jurisdiction.reportCurrency,
    method: method.id,
    disposals: lines,
    taxableBaseReport,
    taxAmountReport,
    appliedBrackets,
    includedCount,
    needsReviewCount,
    excludedCount,
    warnings,
  };
}
