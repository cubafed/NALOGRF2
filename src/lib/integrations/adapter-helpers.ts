import type { TransactionType } from "@/lib/domain/types";

/**
 * Normalize an exchange timestamp into a format the universal parser accepts
 * (YYYY-MM-DD or an ISO timestamp ending in Z). Handles the common
 * "YYYY-MM-DD HH:MM:SS" exchange format and already-ISO values. Returns the
 * raw input untouched if it does not match a known shape, so the universal
 * parser can flag it as INVALID_DATE rather than this helper guessing.
 */
export function normalizeExchangeDate(raw: string): string {
  const value = raw.trim();
  if (value === "") return "";
  // Already canonical date-only.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // Already an ISO instant ending in Z.
  if (/^\d{4}-\d{2}-\d{2}T.+Z$/.test(value)) return value;
  // "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SSZ"
  const spaced = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/);
  if (spaced) return `${spaced[1]}T${spaced[2]}Z`;
  // "YYYY-MM-DD HH:MM" → add seconds.
  const noSeconds = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/);
  if (noSeconds) return `${noSeconds[1]}T${noSeconds[2]}:00Z`;
  return value;
}

/** Drop a leading sign and surrounding whitespace; keeps the numeric magnitude. */
export function absAmount(raw: string): string {
  const value = raw.trim().replace(/^[+-]/, "");
  return value;
}

/**
 * Map a free-text exchange operation label to a canonical TransactionType using a
 * keyword table. Matching is case-insensitive and substring-based against the table
 * keys, in the order provided. Unmatched labels become "unknown".
 */
export function mapOperation(
  label: string,
  table: ReadonlyArray<[match: string, type: TransactionType]>,
): TransactionType {
  const lower = label.trim().toLowerCase();
  for (const [needle, type] of table) {
    if (lower.includes(needle)) return type;
  }
  return "unknown";
}
