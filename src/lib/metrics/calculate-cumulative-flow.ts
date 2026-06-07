import type { FiatFlowResult } from "./analytics-types";

export interface CumulativeFlowPoint {
  month: string;
  /** Net flow for this month (inflow − outflow). */
  net: number;
  /** Running cumulative net up to and including this month. */
  cumulative: number;
}

export interface CumulativeFlowByCurrency {
  currency: string;
  points: CumulativeFlowPoint[];
}

export interface CumulativeFlowResult {
  byCurrency: CumulativeFlowByCurrency[];
}

/**
 * Derive a running cumulative net-flow series per currency from a FiatFlowResult.
 * Pure and deterministic: it only accumulates the already-computed monthly net values;
 * currencies are never mixed. Month order is preserved from the source (chronological,
 * with any "unknown-date" bucket last).
 */
export function calculateCumulativeFlow(fiatFlow: FiatFlowResult): CumulativeFlowResult {
  const byCurrency: CumulativeFlowByCurrency[] = fiatFlow.byCurrency.map((currency) => {
    let running = 0;
    const points: CumulativeFlowPoint[] = currency.months.map((bucket) => {
      running += bucket.net;
      return { month: bucket.month, net: bucket.net, cumulative: running };
    });
    return { currency: currency.currency, points };
  });

  return { byCurrency };
}
