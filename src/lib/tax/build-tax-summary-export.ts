import type {
  PreliminaryTaxEstimate,
  PreliminaryTaxEstimateLine,
} from "@/lib/tax/manual-cost-basis-types";
import {
  TAX_SUMMARY_DISCLAIMER,
  TAX_SUMMARY_METHODOLOGY_NOTE,
  type BuildTaxSummaryExportOptions,
  type TaxSummaryExport,
  type TaxSummaryExportOperation,
} from "@/lib/tax/tax-summary-export-types";

function toOperation(line: PreliminaryTaxEstimateLine): TaxSummaryExportOperation {
  return {
    transactionId: line.transactionId,
    rawRowId: line.rawRowId,
    date: line.date,
    type: line.type,
    asset: line.asset,
    amount: line.amount,
    fiatCurrency: line.fiatCurrency,
    classificationCategory: line.classificationCategory,
    status: line.status,
    reasonCode: line.reasonCode,
    proceedsFiat: line.proceedsFiat,
    manualCostBasisFiat: line.manualCostBasisFiat,
    feeFiat: line.feeFiat,
    preliminaryTaxableResultFiat: line.preliminaryTaxableResultFiat,
  };
}

/**
 * Deterministically derive a tax year from operation dates.
 * Returns a single year only when every dated operation shares the same year;
 * otherwise null (the export should not guess a year for mixed-year data).
 */
function deriveTaxYear(lines: readonly PreliminaryTaxEstimateLine[]): number | null {
  const years = new Set<number>();
  for (const line of lines) {
    const match = (line.date ?? "").match(/^(\d{4})/);
    if (match) years.add(Number(match[1]));
  }
  return years.size === 1 ? [...years][0] : null;
}

/**
 * Build a local tax summary export payload from a preliminary estimate.
 * Pure and deterministic (timestamp/year are injectable). No tax due, no
 * filing, no advice — just an organized summary for an accountant.
 */
export function buildTaxSummaryExport(
  estimate: PreliminaryTaxEstimate,
  options: BuildTaxSummaryExportOptions = {},
): TaxSummaryExport {
  const { lines, summary } = estimate;

  const included = lines.filter((l) => l.status === "included").map(toOperation);
  const excluded = lines.filter((l) => l.status === "excluded").map(toOperation);
  const needsReview = lines.filter((l) => l.status === "needs_review").map(toOperation);

  const unsupportedOperations = lines.filter(
    (l) => l.classificationCategory === "unsupported",
  ).length;

  const taxYear =
    options.taxYear !== undefined ? options.taxYear : deriveTaxYear(lines);

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    taxYear,
    fiatCurrency: summary.fiatCurrency,
    totals: {
      totalOperations: summary.totalOperations,
      includedOperations: summary.includedOperations,
      excludedOperations: summary.excludedOperations,
      needsReviewOperations: summary.needsReviewOperations,
      unsupportedOperations,
      totalProceedsFiat: summary.totalProceedsFiat,
      totalManualCostBasisFiat: summary.totalManualCostBasisFiat,
      totalFeesFiat: summary.totalFeesFiat,
      preliminaryTaxableResultFiat: summary.preliminaryTaxableResultFiat,
    },
    included,
    excluded,
    needsReview,
    disclaimer: TAX_SUMMARY_DISCLAIMER,
    methodologyNote: TAX_SUMMARY_METHODOLOGY_NOTE,
  };
}

const CSV_COLUMNS = [
  "section",
  "transaction_id",
  "raw_row_id",
  "date",
  "type",
  "asset",
  "amount",
  "fiat_currency",
  "classification",
  "status",
  "reason_code",
  "proceeds_fiat",
  "manual_cost_basis_fiat",
  "fee_fiat",
  "preliminary_taxable_result_fiat",
] as const;

function escapeCsv(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function operationRow(section: string, op: TaxSummaryExportOperation): string {
  return [
    section,
    op.transactionId,
    op.rawRowId,
    op.date,
    op.type,
    op.asset,
    op.amount,
    op.fiatCurrency,
    op.classificationCategory,
    op.status,
    op.reasonCode,
    op.proceedsFiat,
    op.manualCostBasisFiat,
    op.feeFiat,
    op.preliminaryTaxableResultFiat,
  ]
    .map(escapeCsv)
    .join(",");
}

/**
 * Serialize a tax summary export to a simple flat CSV (no new dependencies).
 * Every operation is present with an `included` / `excluded` / `needs_review`
 * section marker, so nothing is hidden from the reviewer.
 */
export function serializeTaxSummaryCsv(summary: TaxSummaryExport): string {
  const rows: string[] = [CSV_COLUMNS.join(",")];
  for (const op of summary.included) rows.push(operationRow("included", op));
  for (const op of summary.excluded) rows.push(operationRow("excluded", op));
  for (const op of summary.needsReview) rows.push(operationRow("needs_review", op));
  return rows.join("\n");
}
