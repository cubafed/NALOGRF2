import type {
  AcquisitionLot,
  CostBasisMethod,
  DisposalLine,
  MatchedPortion,
} from "@/lib/tax/engine/engine-types";

const EPSILON = 1e-9;

/** Sort key: chronological by date, ties broken by transaction id for determinism. */
function chronological(
  a: { date?: string; key: string },
  b: { date?: string; key: string },
): number {
  const da = a.date ?? "";
  const db = b.date ?? "";
  if (da !== db) {
    // Empty dates sort last so dated lots are consumed first.
    if (da === "") return 1;
    if (db === "") return -1;
    return da < db ? -1 : 1;
  }
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/**
 * First-In-First-Out cost-basis matching. Disposals are matched against the earliest
 * available acquisition lots for the same asset. A disposal that exceeds available lots
 * is `needs_review` (uncovered quantity — never invents a lot); a disposal that consumes
 * a lot of unknown cost is `needs_review` (cost cannot be computed); a disposal missing
 * fiat proceeds is `needs_review`. Fully covered disposals with known cost are `included`.
 */
export const fifoMethod: CostBasisMethod = {
  id: "fifo",

  matchDisposals({ lots, disposals }) {
    // Working copy of remaining quantity per lot, grouped by asset, sorted FIFO.
    const lotsByAsset = new Map<string, Array<AcquisitionLot & { remaining: number }>>();
    for (const lot of lots) {
      const list = lotsByAsset.get(lot.asset) ?? [];
      list.push({ ...lot, remaining: lot.quantity });
      lotsByAsset.set(lot.asset, list);
    }
    for (const list of lotsByAsset.values()) {
      list.sort((a, b) =>
        chronological({ date: a.date, key: a.transactionId }, { date: b.date, key: b.transactionId }),
      );
    }

    const ordered = [...disposals].sort((a, b) =>
      chronological(
        { date: a.date, key: a.transaction.id },
        { date: b.date, key: b.transaction.id },
      ),
    );

    return ordered.map((disposal): DisposalLine => {
      const list = lotsByAsset.get(disposal.asset) ?? [];
      let need = disposal.quantity;
      const matched: MatchedPortion[] = [];
      let anyUnknownCost = false;

      for (const lot of list) {
        if (need <= EPSILON) break;
        if (lot.remaining <= EPSILON) continue;

        const take = Math.min(lot.remaining, need);
        lot.remaining -= take;
        need -= take;

        const costReport =
          lot.unitCostReport === null ? null : lot.unitCostReport * take;
        if (costReport === null) anyUnknownCost = true;
        matched.push({ lotTransactionId: lot.transactionId, quantity: take, costReport });
      }

      const uncoveredQuantity = need > EPSILON ? need : 0;
      const coveredQuantity = disposal.quantity - uncoveredQuantity;

      const costBasisReport =
        anyUnknownCost || uncoveredQuantity > 0
          ? null
          : matched.reduce((sum, portion) => sum + (portion.costReport ?? 0), 0);

      let status: DisposalLine["status"];
      let reason: string;
      let gainReport: number | null = null;

      if (disposal.proceedsReport === null) {
        status = "needs_review";
        reason = "missing_fiat_proceeds";
      } else if (uncoveredQuantity > 0) {
        status = "needs_review";
        reason = "uncovered_disposal_no_acquisition";
      } else if (costBasisReport === null) {
        status = "needs_review";
        reason = "unknown_cost_basis";
      } else {
        status = "included";
        reason = "matched";
        gainReport = disposal.proceedsReport - costBasisReport - disposal.feeReport;
      }

      return {
        transactionId: disposal.transaction.id,
        asset: disposal.asset,
        date: disposal.date,
        quantity: disposal.quantity,
        proceedsReport: disposal.proceedsReport,
        feeReport: disposal.feeReport,
        matched,
        coveredQuantity,
        uncoveredQuantity,
        costBasisReport,
        gainReport,
        status,
        reason,
      };
    });
  },
};
