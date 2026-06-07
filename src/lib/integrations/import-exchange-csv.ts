import { parseCsvToObjects } from "@/lib/parsers/csv-tokenizer";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import type { ParseUniversalCsvResult } from "@/lib/parsers/parser-types";
import type { CanonicalRow, ExchangeAdapter } from "@/lib/integrations/integration-types";
import { detectAdapter, getAdapterById } from "@/lib/integrations/registry";

const CANONICAL_HEADERS = [
  "date",
  "type",
  "asset",
  "amount",
  "price",
  "fiat_value",
  "fiat_currency",
  "fee",
  "fee_asset",
  "tx_hash",
  "order_id",
  "counterparty",
  "source",
  "notes",
] as const;

export interface ImportExchangeCsvResult extends ParseUniversalCsvResult {
  /** The adapter that handled the file, or null when none could be detected. */
  adapterId: string | null;
  adapterLabel: string | null;
  /** Number of exact-duplicate canonical rows removed before parsing. */
  duplicatesRemoved: number;
}

export interface ImportExchangeCsvOptions {
  /** Force a specific adapter by id; when omitted the adapter is auto-detected. */
  adapterId?: string;
}

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

/** Serialize canonical rows into a universal CSV string the universal parser accepts. */
function toCanonicalCsv(rows: CanonicalRow[]): string {
  const lines = [CANONICAL_HEADERS.join(",")];
  for (const row of rows) {
    const cells = CANONICAL_HEADERS.map((header) => {
      const value = (row as unknown as Record<string, string | undefined>)[header];
      return escapeCsvCell(value ?? "");
    });
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

/** Stable key used to drop exact-duplicate canonical rows from re-exported overlaps. */
function dedupeKey(row: CanonicalRow): string {
  return [
    row.date,
    row.type,
    row.asset,
    row.amount,
    row.tx_hash ?? "",
    row.order_id ?? "",
    row.notes ?? "",
  ].join("|");
}

/**
 * Import an exchange CSV export. Detects (or uses) the matching adapter, maps each
 * exchange row into canonical rows, removes exact duplicates, then runs the canonical
 * rows through the existing universal parser so all validation lives in one place.
 *
 * When no adapter matches, the file is parsed directly as a universal CSV (so an
 * already-canonical file still works), and `adapterId` is null.
 */
export function importExchangeCsv(
  csv: string,
  options: ImportExchangeCsvOptions = {},
): ImportExchangeCsvResult {
  const { headers } = parseCsvToObjects(csv);
  const adapter: ExchangeAdapter | null = options.adapterId
    ? getAdapterById(options.adapterId)
    : detectAdapter(headers);

  if (!adapter) {
    // Fall back to treating the file as already-canonical universal CSV.
    const result = parseUniversalCsv(csv);
    return { ...result, adapterId: null, adapterLabel: null, duplicatesRemoved: 0 };
  }

  const { rows } = parseCsvToObjects(csv);
  const mapped: CanonicalRow[] = [];
  for (const { values } of rows) {
    mapped.push(...adapter.mapRow(values));
  }

  const seen = new Set<string>();
  const deduped: CanonicalRow[] = [];
  let duplicatesRemoved = 0;
  for (const row of mapped) {
    const key = dedupeKey(row);
    if (seen.has(key)) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    deduped.push(row);
  }

  const canonicalCsv = toCanonicalCsv(deduped);
  const result = parseUniversalCsv(canonicalCsv, { sourceName: adapter.label });

  return {
    ...result,
    adapterId: adapter.id,
    adapterLabel: adapter.label,
    duplicatesRemoved,
  };
}
