import type {
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
  };

  for (const line of lines) {
    if (line.classificationCategory === "taxable_candidate") {
      summary.taxableCandidates += 1;
    }

    if (line.status === "included") {
      summary.includedOperations += 1;
      summary.totalProceedsFiat += line.proceedsFiat ?? 0;
      summary.totalManualCostBasisFiat += line.manualCostBasisFiat ?? 0;
      summary.totalFeesFiat += line.feeFiat;
      summary.preliminaryTaxableResultFiat += line.preliminaryTaxableResultFiat ?? 0;
      summary.fiatCurrency = line.fiatCurrency;
    } else if (line.status === "excluded") {
      summary.excludedOperations += 1;
    } else {
      summary.needsReviewOperations += 1;
    }
  }

  return summary;
}
