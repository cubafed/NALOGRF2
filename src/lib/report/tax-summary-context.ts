import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";

export interface TaxSummaryContext {
  hasCostBasis: boolean;
  entryCount: number;
}

/**
 * Derives whether a preliminary tax estimate context exists for the report.
 * Returns counts for display; never interprets or sums monetary values.
 */
export function getTaxSummaryContext(
  entries: ManualCostBasisByTransactionId,
): TaxSummaryContext {
  const entryCount = Object.keys(entries).length;
  return {
    hasCostBasis: entryCount > 0,
    entryCount,
  };
}
