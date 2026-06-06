import type { Transaction } from "@/lib/domain/types";

/**
 * Converts an amount in some currency, on a given date, into the report currency.
 * `getRate` returns the multiplier (1 unit of `currency` = rate report-currency units),
 * or `null` when no rate is available for that currency/date — callers must then mark the
 * affected operation `needs_review` rather than guessing.
 */
export interface RateLookup {
  reportCurrency: string;
  getRate(currency: string, date: string | undefined): number | null;
}

/** A parcel of an asset acquired at a point in time (FIFO/LIFO/etc. consume these). */
export interface AcquisitionLot {
  transactionId: string;
  asset: string;
  date?: string;
  /** Units acquired (> 0). */
  quantity: number;
  /** Cost per unit in the report currency; `null` when the acquisition cost is unknown. */
  unitCostReport: number | null;
  source: "history" | "manual";
}

/** One acquisition lot consumed (partially or fully) by a disposal. */
export interface MatchedPortion {
  lotTransactionId: string;
  quantity: number;
  /** Cost of this portion in report currency; `null` when the lot cost is unknown. */
  costReport: number | null;
}

export type DisposalStatus = "included" | "needs_review" | "excluded";

/** A disposal (sell/p2p) after cost-basis matching and currency conversion. */
export interface DisposalLine {
  transactionId: string;
  asset: string;
  date?: string;
  quantity: number;
  proceedsReport: number | null;
  feeReport: number;
  matched: MatchedPortion[];
  coveredQuantity: number;
  /** Quantity sold beyond available acquisition lots (> 0 ⇒ needs_review). */
  uncoveredQuantity: number;
  /** Total matched cost in report currency; `null` when unknown or partly uncovered. */
  costBasisReport: number | null;
  /** proceeds − cost − fee, in report currency; `null` when it cannot be computed. */
  gainReport: number | null;
  status: DisposalStatus;
  reason: string;
}

export interface AppliedBracket {
  /** Upper bound of the bracket in report currency, or `null` for the top bracket. */
  upTo: number | null;
  rate: number;
  /** Portion of the taxable base taxed at this bracket. */
  baseInBracket: number;
  taxInBracket: number;
}

/** Per-jurisdiction rules: report currency, locale, and rate application. */
export interface JurisdictionModule {
  code: string;
  reportCurrency: string;
  locale: string;
  /**
   * Apply the jurisdiction's progressive rate to a taxable base (report currency).
   * A base ≤ 0 yields zero tax (losses do not create a liability here).
   */
  computeTax(taxableBaseReport: number): {
    taxAmountReport: number;
    appliedBrackets: AppliedBracket[];
  };
}

/** A cost-basis matching strategy (FIFO first; LIFO/HIFO/ACB later). */
export interface CostBasisMethod {
  id: string;
  matchDisposals(input: {
    lots: AcquisitionLot[];
    disposals: Array<{
      transaction: Transaction;
      asset: string;
      date?: string;
      quantity: number;
      proceedsReport: number | null;
      feeReport: number;
    }>;
  }): DisposalLine[];
}

export interface TaxEngineResult {
  jurisdiction: string;
  reportCurrency: string;
  method: string;
  disposals: DisposalLine[];
  /** Net gain across included disposals (can be negative). */
  taxableBaseReport: number;
  /** Preliminary tax on the (clamped) taxable base. Never an official amount due. */
  taxAmountReport: number;
  appliedBrackets: AppliedBracket[];
  includedCount: number;
  needsReviewCount: number;
  excludedCount: number;
  warnings: string[];
}
