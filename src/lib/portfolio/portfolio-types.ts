/** Per-asset portfolio position after FIFO matching, valued in the report currency. */
export interface AssetHolding {
  asset: string;
  /** Units still held (acquisition lots not consumed by disposals). */
  quantity: number;
  /** Remaining cost basis in report currency; `null` when any held lot has unknown cost. */
  costBasisReport: number | null;
  /** Current unit price in report currency, or `null` when no price was supplied. */
  currentPriceReport: number | null;
  /** quantity × currentPrice; `null` when no price is available. */
  marketValueReport: number | null;
  /** marketValue − costBasis; `null` when either side is unknown. */
  unrealizedGainReport: number | null;
  /** Realized gain from disposals of this asset (report currency). */
  realizedGainReport: number;
  /** True when some held lots have unknown acquisition cost (basis incomplete). */
  hasUnknownCost: boolean;
}

/** Whole-portfolio valuation and P&L, all in one report currency. */
export interface PortfolioResult {
  reportCurrency: string;
  holdings: AssetHolding[];
  /** Sum of holdings' market value; `null` when any held asset lacks a price. */
  totalMarketValueReport: number | null;
  /** Sum of holdings' cost basis; `null` when any held asset has unknown cost. */
  totalCostBasisReport: number | null;
  /** totalMarketValue − totalCostBasis; `null` when either is unknown. */
  totalUnrealizedGainReport: number | null;
  /** Sum of realized gains across all disposals (report currency). */
  totalRealizedGainReport: number;
  warnings: string[];
}
