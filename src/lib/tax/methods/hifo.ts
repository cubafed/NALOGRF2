import { chronological, createCostBasisMethod } from "@/lib/tax/methods/match-core";

/**
 * Highest-In-First-Out cost-basis matching. Disposals consume the highest-unit-cost lots
 * first (minimizing realized gain). Lots with unknown cost are kept last so known-cost lots
 * are preferred; among equal costs (and among unknown-cost lots) ties break chronologically
 * for determinism. Uncovered quantity / unknown cost / missing proceeds → needs_review.
 */
export const hifoMethod = createCostBasisMethod("hifo", (a, b) => {
  const ca = a.unitCostReport;
  const cb = b.unitCostReport;
  // Unknown-cost lots sort last.
  if (ca === null && cb === null) {
    return chronological(
      { date: a.date, key: a.transactionId },
      { date: b.date, key: b.transactionId },
    );
  }
  if (ca === null) return 1;
  if (cb === null) return -1;
  if (ca !== cb) return cb - ca; // higher cost first
  return chronological(
    { date: a.date, key: a.transactionId },
    { date: b.date, key: b.transactionId },
  );
});
