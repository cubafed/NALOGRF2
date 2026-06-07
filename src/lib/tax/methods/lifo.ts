import { chronological, createCostBasisMethod } from "@/lib/tax/methods/match-core";

/**
 * Last-In-First-Out cost-basis matching. Disposals consume the most recently acquired
 * lots first (reverse chronological). Undated lots are kept last (consumed only after all
 * dated lots), matching FIFO's treatment of unknown dates so behaviour stays predictable.
 * Uncovered quantity / unknown cost / missing proceeds → needs_review.
 */
export const lifoMethod = createCostBasisMethod("lifo", (a, b) => {
  const da = a.date ?? "";
  const db = b.date ?? "";
  // Undated lots sort last regardless of direction.
  if (da === "" && db === "") return a.transactionId < b.transactionId ? -1 : 1;
  if (da === "") return 1;
  if (db === "") return -1;
  // Reverse chronological: latest date first, ties by transaction id (reversed) for determinism.
  return -chronological(
    { date: a.date, key: a.transactionId },
    { date: b.date, key: b.transactionId },
  );
});
