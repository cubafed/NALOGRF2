import type { Transaction, TransactionType } from "@/lib/domain/types";
import type { AcquisitionLot, RateLookup } from "@/lib/tax/engine/engine-types";
import type { ManualCostBasisByTransactionId } from "@/lib/tax/manual-cost-basis-types";
import { convertToReport } from "@/lib/tax/rates/convert";

/** Operation types that add to an asset's acquisition lots. */
const ACQUISITION_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>([
  "buy",
  "income",
  "deposit",
]);

function parsePositive(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeAsset(asset: string | undefined): string {
  return (asset ?? "").trim().toUpperCase();
}

export function isAcquisition(transaction: Transaction): boolean {
  return ACQUISITION_TYPES.has(transaction.type);
}

/**
 * Build acquisition lots (one per acquisition transaction) with per-unit cost in the
 * report currency. Cost preference: manual cost basis override → transaction.fiatValue,
 * each converted on the transaction date. When neither is available or the rate is
 * missing, `unitCostReport` is `null` (cost unknown) so disposals consuming the lot are
 * later flagged `needs_review` rather than assigned a guessed basis.
 *
 * Deterministic: lots preserve input order (callers sort per method).
 */
export function buildAcquisitionLots(
  transactions: readonly Transaction[],
  rates: RateLookup,
  manualCostBasis: ManualCostBasisByTransactionId = {},
): AcquisitionLot[] {
  const lots: AcquisitionLot[] = [];

  for (const transaction of transactions) {
    if (!isAcquisition(transaction)) continue;

    const quantity = parsePositive(transaction.amount);
    if (quantity === null) continue;

    const asset = normalizeAsset(transaction.asset);
    if (asset.length === 0) continue;

    const manual = manualCostBasis[transaction.id];
    const manualAmount = parsePositive(manual?.costBasisFiat);

    let totalCostReport: number | null = null;
    let source: AcquisitionLot["source"] = "history";

    if (manualAmount !== null) {
      const manualCurrency = manual?.fiatCurrency ?? transaction.fiatCurrency;
      totalCostReport = convertToReport(manualAmount, manualCurrency, transaction.date, rates);
      source = "manual";
    } else {
      const fiatValue = parsePositive(transaction.fiatValue);
      totalCostReport = convertToReport(
        fiatValue,
        transaction.fiatCurrency,
        transaction.date,
        rates,
      );
    }

    lots.push({
      transactionId: transaction.id,
      asset,
      date: transaction.date,
      quantity,
      unitCostReport: totalCostReport === null ? null : totalCostReport / quantity,
      source,
    });
  }

  return lots;
}
