import type { Transaction } from "@/lib/domain/types";

export interface ParseUniversalCsvOptions {
  sourceName?: string;
}

export type RawCsvRowStatus = "ok" | "warning" | "error";

export interface RawCsvRow {
  rowNumber: number;
  raw: Record<string, string>;
  normalized: Record<string, string>;
  status: RawCsvRowStatus;
}

export type ParserWarningCode =
  | "INVALID_OPTIONAL_NUMBER"
  | "UNKNOWN_TRANSACTION_TYPE"
  | "EXTRA_COLUMN";

export type ParserErrorCode =
  | "EMPTY_CSV"
  | "MISSING_REQUIRED_HEADER"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_DATE"
  | "INVALID_NUMBER";

export interface ParserWarning {
  code: ParserWarningCode;
  message: string;
  rowNumber?: number;
  field?: string;
  value?: string;
  severity: "warning";
}

export interface ParserError {
  code: ParserErrorCode;
  message: string;
  rowNumber?: number;
  field?: string;
  value?: string;
  severity: "error";
}

export interface ParserSummary {
  totalRows: number;
  parsedRows: number;
  warningRows: number;
  errorRows: number;
  transactionCount: number;
  warningCount: number;
  errorCount: number;
}

export interface ParseUniversalCsvResult {
  transactions: Transaction[];
  rawRows: RawCsvRow[];
  warnings: ParserWarning[];
  errors: ParserError[];
  summary: ParserSummary;
}
