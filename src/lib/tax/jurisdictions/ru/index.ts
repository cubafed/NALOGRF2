import type { AppliedBracket, JurisdictionModule } from "@/lib/tax/engine/engine-types";

/**
 * Progressive brackets applied to the taxable base, in report currency (RUB).
 * NOTE: these threshold/rate values are a configurable, documented assumption for the
 * preliminary estimate and must be confirmed against current law for the relevant year.
 * See docs/tax/TAX_METHOD_RUSSIA_V1.md.
 */
export const RU_TAX_BRACKETS: ReadonlyArray<{ upTo: number | null; rate: number }> = [
  { upTo: 5_000_000, rate: 0.13 },
  { upTo: null, rate: 0.15 },
];

function applyBrackets(
  base: number,
  brackets: ReadonlyArray<{ upTo: number | null; rate: number }>,
): { taxAmountReport: number; appliedBrackets: AppliedBracket[] } {
  const applied: AppliedBracket[] = [];
  let remaining = base;
  let lowerBound = 0;
  let tax = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const span =
      bracket.upTo === null ? remaining : Math.max(0, Math.min(remaining, bracket.upTo - lowerBound));
    const taxInBracket = span * bracket.rate;
    tax += taxInBracket;
    applied.push({
      upTo: bracket.upTo,
      rate: bracket.rate,
      baseInBracket: span,
      taxInBracket,
    });
    remaining -= span;
    lowerBound = bracket.upTo ?? lowerBound;
  }

  return { taxAmountReport: tax, appliedBrackets: applied };
}

/**
 * Flat NDFL rate for RU tax non-residents on this income type — a configurable, documented
 * assumption for the preliminary estimate; confirm against current law for the relevant year.
 */
export const RU_NON_RESIDENT_BRACKETS: ReadonlyArray<{ upTo: number | null; rate: number }> = [
  { upTo: null, rate: 0.3 },
];

/**
 * Russia, tax resident — RUB report currency, progressive NDFL (13% then 15% above 5M RUB).
 * Output is preliminary, for review with an accountant — never an official amount due.
 */
export const ruResidentJurisdiction: JurisdictionModule = {
  code: "ru_resident",
  reportCurrency: "RUB",
  locale: "ru-RU",
  computeTax(taxableBaseReport) {
    if (!Number.isFinite(taxableBaseReport) || taxableBaseReport <= 0) {
      return { taxAmountReport: 0, appliedBrackets: [] };
    }
    return applyBrackets(taxableBaseReport, RU_TAX_BRACKETS);
  },
};

/**
 * Russia, tax non-resident — RUB report currency, flat 30% NDFL on this income type.
 * Output is preliminary, for review with an accountant — never an official amount due.
 */
export const ruNonResidentJurisdiction: JurisdictionModule = {
  code: "ru_nonresident",
  reportCurrency: "RUB",
  locale: "ru-RU",
  computeTax(taxableBaseReport) {
    if (!Number.isFinite(taxableBaseReport) || taxableBaseReport <= 0) {
      return { taxAmountReport: 0, appliedBrackets: [] };
    }
    return applyBrackets(taxableBaseReport, RU_NON_RESIDENT_BRACKETS);
  },
};

/** Backwards-compatible alias: the default RU jurisdiction is the resident profile. */
export const ruJurisdiction: JurisdictionModule = ruResidentJurisdiction;
