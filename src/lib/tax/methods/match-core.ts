import type {
  AcquisitionLot,
  CostBasisMethod,
  DisposalLine,
  MatchedPortion,
} from "@/lib/tax/engine/engine-types";

export const EPSILON = 1e-9;

/** Sort key: chronological by date, ties broken by transaction id for determinism. */
export function chronological(
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

/** Orders the acquisition lots of a single asset; the disposal then consumes from the front. */
export type LotComparator = (a: AcquisitionLot, b: AcquisitionLot) => number;

/**
 * Build a cost-basis method from a lot-ordering strategy. The matching skeleton is
 * shared across FIFO/LIFO/HIFO (and future methods): per asset, sort lots by `sortLots`,
 * then consume them front-to-back as each disposal (processed chronologically) is matched.
 * Uncovered quantity, unknown cost, or missing proceeds all yield `needs_review` —
 * never a guessed basis. Only the lot ordering differs between methods.
 */
export function createCostBasisMethod(id: string, sortLots: LotComparator): CostBasisMethod {
  return {
    id,

    matchDisposals({ lots, disposals }) {
      // Working copy of remaining quantity per lot, grouped by asset, ordered per method.
      const lotsByAsset = new Map<string, Array<AcquisitionLot & { remaining: number }>>();
      for (const lot of lots) {
        const list = lotsByAsset.get(lot.asset) ?? [];
        list.push({ ...lot, remaining: lot.quantity });
        lotsByAsset.set(lot.asset, list);
      }
      for (const list of lotsByAsset.values()) {
        list.sort(sortLots);
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

          const costReport = lot.unitCostReport === null ? null : lot.unitCostReport * take;
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
}
