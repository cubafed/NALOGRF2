import type { TransactionType } from "@/lib/domain/types";

/**
 * A canonical row in the universal CSV shape. Adapters map exchange-specific columns
 * into this structure; it is then serialized to canonical CSV and fed through the
 * existing `parseUniversalCsv` so all validation/warnings stay in one place.
 */
export interface CanonicalRow {
  date: string;
  type: TransactionType | string;
  asset: string;
  amount: string;
  price?: string;
  fiat_value?: string;
  fiat_currency?: string;
  fee?: string;
  fee_asset?: string;
  tx_hash?: string;
  order_id?: string;
  counterparty?: string;
  source?: string;
  notes?: string;
}

/**
 * An exchange CSV adapter. Pure and deterministic: given one parsed exchange row
 * (header→value), it returns zero or more canonical rows. A single exchange line can
 * expand into multiple canonical rows (e.g. a trade producing a buy + a fee).
 */
export interface ExchangeAdapter {
  /** Stable identifier, e.g. "binance". */
  id: string;
  /** Human-readable label, e.g. "Binance". */
  label: string;
  /**
   * Headers that must all be present for this adapter to auto-detect the file.
   * Matched case-insensitively against the exchange CSV header row.
   */
  signatureHeaders: string[];
  /** Map one exchange row to canonical rows. Return [] to skip an irrelevant row. */
  mapRow(values: Record<string, string>): CanonicalRow[];
}
