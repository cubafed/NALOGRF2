import type { JurisdictionModule } from "@/lib/tax/engine/engine-types";
import { ruResidentJurisdiction, ruNonResidentJurisdiction } from "@/lib/tax/jurisdictions/ru";

export {
  ruResidentJurisdiction,
  ruNonResidentJurisdiction,
  ruJurisdiction,
  RU_TAX_BRACKETS,
  RU_NON_RESIDENT_BRACKETS,
} from "@/lib/tax/jurisdictions/ru";

/**
 * Metadata for a selectable tax jurisdiction/profile. `module` is the deterministic
 * engine implementation for "available" jurisdictions, and `null` for "planned" ones
 * (listed in the UI as "in development" but never producing tax numbers — unverified
 * figures are not allowed). `rateSummary` is a short human-readable rate description.
 */
export interface JurisdictionInfo {
  code: string;
  label: string;
  reportCurrency: string;
  status: "available" | "planned";
  rateSummary: string;
  module: JurisdictionModule | null;
}

export const DEFAULT_JURISDICTION_CODE = "ru_resident";

/** Registry of jurisdictions/profiles. RU profiles are implemented; others are planned. */
export const jurisdictions: readonly JurisdictionInfo[] = [
  {
    code: "ru_resident",
    label: "Россия — налоговый резидент",
    reportCurrency: "RUB",
    status: "available",
    rateSummary: "НДФЛ 13% до 5 000 000 ₽, далее 15%",
    module: ruResidentJurisdiction,
  },
  {
    code: "ru_nonresident",
    label: "Россия — налоговый нерезидент",
    reportCurrency: "RUB",
    status: "available",
    rateSummary: "НДФЛ 30% (плоская ставка)",
    module: ruNonResidentJurisdiction,
  },
  {
    code: "us",
    label: "США",
    reportCurrency: "USD",
    status: "planned",
    rateSummary: "В разработке",
    module: null,
  },
  {
    code: "uk",
    label: "Великобритания",
    reportCurrency: "GBP",
    status: "planned",
    rateSummary: "В разработке",
    module: null,
  },
  {
    code: "de",
    label: "Германия",
    reportCurrency: "EUR",
    status: "planned",
    rateSummary: "В разработке",
    module: null,
  },
];

/** Look up jurisdiction metadata by code; null for unknown codes. */
export function getJurisdictionInfo(code: string): JurisdictionInfo | null {
  return jurisdictions.find((j) => j.code === code) ?? null;
}

/**
 * Resolve the deterministic engine module for a jurisdiction code. Returns null for
 * unknown codes and for "planned" jurisdictions (which never produce tax numbers).
 */
export function getJurisdiction(code: string): JurisdictionModule | null {
  return getJurisdictionInfo(code)?.module ?? null;
}
