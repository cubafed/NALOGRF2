import type { Transaction } from "@/lib/domain/types";
import { buildAcquisitionLots } from "@/lib/tax/lots/build-lots";
import { buildDisposalInputs } from "@/lib/tax/engine/build-disposals";
import { fifoMethod } from "@/lib/tax/methods/fifo";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";
import type {
  CostBasisMethod,
  JurisdictionModule,
  RateLookup,
  TaxEngineResult,
} from "@/lib/tax/engine/engine-types";

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
  const disposals = buildDisposalInputs(transactions, rates);

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
