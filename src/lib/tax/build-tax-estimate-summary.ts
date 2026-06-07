import type {
  PreliminaryTaxEstimateCurrencyTotals,
  PreliminaryTaxEstimateLine,
  PreliminaryTaxEstimateSummary,
} from "@/lib/tax/manual-cost-basis-types";

export function buildTaxEstimateSummary(
  lines: readonly PreliminaryTaxEstimateLine[],
): PreliminaryTaxEstimateSummary {
  if (!Array.isArray(lines)) {
    throw new TypeError("buildTaxEstimateSummary expects an array of estimate lines.");
  }

  const summary: PreliminaryTaxEstimateSummary = {
    totalOperations: lines.length,
    includedOperations: 0,
    excludedOperations: 0,
    needsReviewOperations: 0,
    taxableCandidates: 0,
    totalProceedsFiat: 0,
    totalManualCostBasisFiat: 0,
    totalFeesFiat: 0,
    preliminaryTaxableResultFiat: 0,
    fiatCurrency: "RUB",
    byCurrency: [],
  };

  // Group included operations by currency so values are never summed across
  // different currencies. Insertion order is preserved for determinism.
  const currencyTotals = new Map<string, PreliminaryTaxEstimateCurrencyTotals>();

  for (const line of lines) {
    if (line.classificationCategory === "taxable_candidate") {
      summary.taxableCandidates += 1;
    }

    if (line.status === "included") {
      summary.includedOperations += 1;

      const currency = line.fiatCurrency;
      const totals = currencyTotals.get(currency) ?? {
        fiatCurrency: currency,
        includedOperations: 0,
        totalProceedsFiat: 0,
        totalManualCostBasisFiat: 0,
        totalFeesFiat: 0,
        preliminaryTaxableResultFiat: 0,
      };

      totals.includedOperations += 1;
      totals.totalProceedsFiat += line.proceedsFiat ?? 0;
      totals.totalManualCostBasisFiat += line.manualCostBasisFiat ?? 0;
      totals.totalFeesFiat += line.feeFiat;
      totals.preliminaryTaxableResultFiat += line.preliminaryTaxableResultFiat ?? 0;
      currencyTotals.set(currency, totals);
    } else if (line.status === "excluded") {
      summary.excludedOperations += 1;
    } else {
      summary.needsReviewOperations += 1;
    }
  }

  summary.byCurrency = Array.from(currencyTotals.values());

  // Flat totals remain meaningful for the single-currency case; the dominant
  // currency is the one with the most included operations.
  const dominant = summary.byCurrency.reduce<PreliminaryTaxEstimateCurrencyTotals | null>(
    (best, current) =>
      best === null || current.includedOperations > best.includedOperations ? current : best,
    null,
  );

  if (dominant) {
    summary.fiatCurrency = dominant.fiatCurrency;
  }

  for (const totals of summary.byCurrency) {
    summary.totalProceedsFiat += totals.totalProceedsFiat;
    summary.totalManualCostBasisFiat += totals.totalManualCostBasisFiat;
    summary.totalFeesFiat += totals.totalFeesFiat;
    summary.preliminaryTaxableResultFiat += totals.preliminaryTaxableResultFiat;
  }

  return summary;
}
