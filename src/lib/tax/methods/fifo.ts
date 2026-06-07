import { chronological, createCostBasisMethod } from "@/lib/tax/methods/match-core";

/**
 * First-In-First-Out cost-basis matching. Disposals consume the earliest available
 * acquisition lots for the same asset (chronological by date, ties by transaction id;
 * undated lots last). Uncovered quantity / unknown cost / missing proceeds → needs_review.
 */
export const fifoMethod = createCostBasisMethod("fifo", (a, b) =>
  chronological(
    { date: a.date, key: a.transactionId },
    { date: b.date, key: b.transactionId },
  ),
);
