import type { Transaction } from "@/lib/domain/types";
import { buildAcquisitionLots } from "@/lib/tax/lots/build-lots";
import { buildDisposalInputs } from "@/lib/tax/engine/build-disposals";
import { fifoMethod } from "@/lib/tax/methods/fifo";
import type { CostBasisMethod, RateLookup } from "@/lib/tax/engine/engine-types";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";
import type { AssetHolding, PortfolioResult } from "@/lib/portfolio/portfolio-types";

const EPSILON = 1e-9;

export interface CalculatePortfolioOptions {
  transactions: readonly Transaction[];
  rates: RateLookup;
  /**
   * Current unit price per asset in the report currency (e.g. derived from the Phase 2
   * price client). Missing/`null` entries leave market value and unrealized P&L unknown
   * rather than guessed.
   */
  currentPrices?: Record<string, number | null>;
  manualCostBasis?: ManualCostBasisByTransactionId;
  /** Defaults to FIFO. */
  method?: CostBasisMethod;
}

interface MutableHolding {
  asset: string;
  quantity: number;
  costBasisReport: number;
  hasUnknownCost: boolean;
  realizedGainReport: number;
}

function normalizePrice(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Deterministic portfolio view: holdings, valuation, realized and unrealized P&L.
 *
 * Reuses the tax engine's acquisition lots, disposal extraction, and FIFO matching so
 * cost basis is consistent with the tax calculator. Remaining holdings are the
 * acquisition lots not consumed by disposals (sell/p2p); withdrawals/transfers are NOT
 * treated as disposals, so assets moved to another wallet stay in holdings (treated as
 * still owned, not sold). Unknown acquisition cost or a missing price yields `null`
 * (needs a price/basis), never a guessed figure. All figures are in one report currency.
 */
export function calculatePortfolio({
  transactions,
  rates,
  currentPrices = {},
  manualCostBasis = {},
  method = fifoMethod,
}: CalculatePortfolioOptions): PortfolioResult {
  if (!Array.isArray(transactions)) {
    throw new TypeError("calculatePortfolio expects an array of transactions.");
  }

  const warnings: string[] = [];

  const lots = buildAcquisitionLots(transactions, rates, manualCostBasis);
  const disposals = buildDisposalInputs(transactions, rates);
  const lines = method.matchDisposals({ lots, disposals });

  // Quantity consumed per acquisition lot (summed across all disposals that matched it).
  const consumedByLot = new Map<string, number>();
  let needsReviewCount = 0;
  const realizedByAsset = new Map<string, number>();

  for (const line of lines) {
    for (const portion of line.matched) {
      consumedByLot.set(
        portion.lotTransactionId,
        (consumedByLot.get(portion.lotTransactionId) ?? 0) + portion.quantity,
      );
    }
    if (line.status === "included" && line.gainReport !== null) {
      realizedByAsset.set(line.asset, (realizedByAsset.get(line.asset) ?? 0) + line.gainReport);
    } else if (line.status === "needs_review") {
      needsReviewCount += 1;
    }
  }

  // Remaining lots → per-asset holdings.
  const holdingsByAsset = new Map<string, MutableHolding>();
  for (const lot of lots) {
    const consumed = consumedByLot.get(lot.transactionId) ?? 0;
    const remaining = lot.quantity - consumed;
    if (remaining <= EPSILON) continue;

    const holding =
      holdingsByAsset.get(lot.asset) ??
      ({
        asset: lot.asset,
        quantity: 0,
        costBasisReport: 0,
        hasUnknownCost: false,
        realizedGainReport: 0,
      } satisfies MutableHolding);

    holding.quantity += remaining;
    if (lot.unitCostReport === null) {
      holding.hasUnknownCost = true;
    } else {
      holding.costBasisReport += remaining * lot.unitCostReport;
    }
    holdingsByAsset.set(lot.asset, holding);
  }

  // Fold realized P&L into existing holdings, and surface assets that are fully disposed.
  for (const [asset, realized] of realizedByAsset) {
    const holding = holdingsByAsset.get(asset);
    if (holding) {
      holding.realizedGainReport += realized;
    } else {
      holdingsByAsset.set(asset, {
        asset,
        quantity: 0,
        costBasisReport: 0,
        hasUnknownCost: false,
        realizedGainReport: realized,
      });
    }
  }

  const holdings: AssetHolding[] = [...holdingsByAsset.values()]
    .map((h): AssetHolding => {
      const costBasisReport = h.hasUnknownCost ? null : h.costBasisReport;
      const currentPriceReport = h.quantity > EPSILON ? normalizePrice(currentPrices[h.asset]) : null;
      const marketValueReport =
        currentPriceReport === null ? null : h.quantity * currentPriceReport;
      const unrealizedGainReport =
        marketValueReport === null || costBasisReport === null
          ? null
          : marketValueReport - costBasisReport;
      return {
        asset: h.asset,
        quantity: h.quantity,
        costBasisReport,
        currentPriceReport,
        marketValueReport,
        unrealizedGainReport,
        realizedGainReport: h.realizedGainReport,
        hasUnknownCost: h.hasUnknownCost,
      };
    })
    .sort((a, b) => a.asset.localeCompare(b.asset));

  // Totals are null when any held asset is missing a price or cost basis.
  const held = holdings.filter((h) => h.quantity > EPSILON);
  const anyMissingPrice = held.some((h) => h.marketValueReport === null);
  const anyMissingCost = held.some((h) => h.costBasisReport === null);

  const totalMarketValueReport = anyMissingPrice
    ? null
    : held.reduce((sum, h) => sum + (h.marketValueReport ?? 0), 0);
  const totalCostBasisReport = anyMissingCost
    ? null
    : held.reduce((sum, h) => sum + (h.costBasisReport ?? 0), 0);
  const totalUnrealizedGainReport =
    totalMarketValueReport === null || totalCostBasisReport === null
      ? null
      : totalMarketValueReport - totalCostBasisReport;
  const totalRealizedGainReport = [...realizedByAsset.values()].reduce((sum, g) => sum + g, 0);

  if (needsReviewCount > 0) {
    warnings.push(
      `${needsReviewCount} операц. требуют проверки (нет курса, себестоимости или покрытия) и не вошли в реализованный P&L.`,
    );
  }
  if (anyMissingPrice) {
    warnings.push("Для части активов нет текущей цены — рыночная стоимость и нереализованный P&L не рассчитаны.");
  }
  if (anyMissingCost) {
    warnings.push("Для части активов неизвестна себестоимость — нереализованный P&L по ним не рассчитан.");
  }

  return {
    reportCurrency: rates.reportCurrency,
    holdings,
    totalMarketValueReport,
    totalCostBasisReport,
    totalUnrealizedGainReport,
    totalRealizedGainReport,
    warnings,
  };
}
