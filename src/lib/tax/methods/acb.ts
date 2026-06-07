import type {
  AcquisitionLot,
  CostBasisMethod,
  DisposalLine,
  MatchedPortion,
} from "@/lib/tax/engine/engine-types";
import { chronological, EPSILON } from "@/lib/tax/methods/match-core";

/**
 * Average Cost Basis (weighted-average) matching.
 *
 * Unlike FIFO/LIFO/HIFO, ACB does not consume discrete lots — it maintains a running
 * per-asset pool (total quantity + total cost) and charges each disposal the pool's
 * current average unit cost. Acquisitions and disposals are therefore processed together
 * in chronological order (acquisitions before disposals on the same date), because the
 * average changes over time.
 *
 * For traceability the disposal still records which lots supplied the quantity (earliest
 * first), but each matched portion is priced at the pool average, not the lot's own cost.
 * If any acquisition with unknown cost has entered the pool, the average is unknown and the
 * disposal is needs_review (`unknown_cost_basis`). Uncovered quantity / missing proceeds
 * follow the same needs_review rules as the other methods — never a guessed basis.
 */
export const acbMethod: CostBasisMethod = {
  id: "acb",

  matchDisposals({ lots, disposals }) {
    type Event =
      | { kind: "acq"; date?: string; key: string; lot: AcquisitionLot }
      | { kind: "disp"; date?: string; key: string; index: number };

    // Per-asset running pool + a FIFO queue of remaining lot quantities for bookkeeping.
    interface Pool {
      quantity: number;
      cost: number;
      unknownCost: boolean;
      remaining: Array<{ transactionId: string; remaining: number }>;
    }
    const pools = new Map<string, Pool>();
    const getPool = (asset: string): Pool => {
      let pool = pools.get(asset);
      if (!pool) {
        pool = { quantity: 0, cost: 0, unknownCost: false, remaining: [] };
        pools.set(asset, pool);
      }
      return pool;
    };

    // Merge acquisitions and disposals into one chronological stream per the whole book.
    const events: Event[] = [];
    for (const lot of lots) {
      events.push({ kind: "acq", date: lot.date, key: lot.transactionId, lot });
    }
    disposals.forEach((disposal, index) => {
      events.push({ kind: "disp", date: disposal.date, key: disposal.transaction.id, index });
    });
    events.sort((a, b) => {
      const byDate = chronological({ date: a.date, key: a.key }, { date: b.date, key: b.key });
      if (byDate !== 0) return byDate;
      // Same date+key tie: acquisitions settle into the pool before disposals draw from it.
      if (a.kind !== b.kind) return a.kind === "acq" ? -1 : 1;
      return 0;
    });

    const linesByIndex: DisposalLine[] = new Array(disposals.length);

    for (const event of events) {
      if (event.kind === "acq") {
        const pool = getPool(event.lot.asset);
        pool.quantity += event.lot.quantity;
        if (event.lot.unitCostReport === null) {
          pool.unknownCost = true;
        } else {
          pool.cost += event.lot.unitCostReport * event.lot.quantity;
        }
        pool.remaining.push({ transactionId: event.lot.transactionId, remaining: event.lot.quantity });
        continue;
      }

      const disposal = disposals[event.index];
      const pool = getPool(disposal.asset);
      const avgUnitCost =
        pool.quantity > EPSILON && !pool.unknownCost ? pool.cost / pool.quantity : null;

      // Consume quantity from earliest remaining lots for traceability (priced at average).
      let need = disposal.quantity;
      const matched: MatchedPortion[] = [];
      for (const slice of pool.remaining) {
        if (need <= EPSILON) break;
        if (slice.remaining <= EPSILON) continue;
        const take = Math.min(slice.remaining, need);
        slice.remaining -= take;
        need -= take;
        matched.push({
          lotTransactionId: slice.transactionId,
          quantity: take,
          costReport: avgUnitCost === null ? null : avgUnitCost * take,
        });
      }

      const uncoveredQuantity = need > EPSILON ? need : 0;
      const coveredQuantity = disposal.quantity - uncoveredQuantity;

      // Reduce the pool by the covered quantity at the average cost (keeps the average stable).
      pool.quantity = Math.max(0, pool.quantity - coveredQuantity);
      if (avgUnitCost !== null) {
        pool.cost = Math.max(0, pool.cost - avgUnitCost * coveredQuantity);
      }

      const costBasisReport =
        pool.unknownCost || avgUnitCost === null || uncoveredQuantity > 0
          ? null
          : avgUnitCost * coveredQuantity;

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

      linesByIndex[event.index] = {
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
    }

    // Return disposals in chronological order, matching the other methods' output ordering.
    return [...linesByIndex]
      .filter((line): line is DisposalLine => line !== undefined)
      .sort((a, b) =>
        chronological({ date: a.date, key: a.transactionId }, { date: b.date, key: b.transactionId }),
      );
  },
};
