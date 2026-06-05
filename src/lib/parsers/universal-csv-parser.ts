import type { Transaction, TransactionType } from "@/lib/domain/types";
import type {
  ParseUniversalCsvOptions,
  ParseUniversalCsvResult,
  ParserError,
  ParserSummary,
  ParserWarning,
  RawCsvRow,
  RawCsvRowStatus,
} from "@/lib/parsers/parser-types";

const REQUIRED_HEADERS = ["date", "type", "asset", "amount"] as const;

const OPTIONAL_HEADERS = [
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

const KNOWN_HEADERS = new Set<string>([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);

const NUMERIC_FIELDS = ["amount", "price", "fiat_value", "fee"] as const;
const OPTIONAL_NUMERIC_FIELDS = new Set<string>(["price", "fiat_value", "fee"]);

const ALLOWED_TRANSACTION_TYPES = new Set<TransactionType>([
  "buy",
  "sell",
  "deposit",
  "withdrawal",
  "transfer",
  "fee",
  "p2p",
  "conversion",
  "income",
  "unknown",
]);

interface CsvRecord {
  rowNumber: number;
  cells: string[];
}

interface RowIssueIndexes {
  warningRows: Set<number>;
  errorRows: Set<number>;
}

export function parseUniversalCsv(
  csv: string,
  options: ParseUniversalCsvOptions = {},
): ParseUniversalCsvResult {
  if (csv.trim() === "") {
    const errors: ParserError[] = [
      {
        code: "EMPTY_CSV",
        message: "CSV is empty.",
        severity: "error",
      },
    ];
    return buildResult([], [], [], errors);
  }

  const records = parseCsvRecords(csv);
  const [headerRecord, ...dataRecords] = records;
  if (!headerRecord) {
    const errors: ParserError[] = [
      {
        code: "EMPTY_CSV",
        message: "CSV is empty.",
        severity: "error",
      },
    ];
    return buildResult([], [], [], errors);
  }

  const headers = headerRecord.cells.map((header) => header.trim());
  const errors: ParserError[] = [];
  const warnings: ParserWarning[] = [];
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  for (const header of missingHeaders) {
    errors.push({
      code: "MISSING_REQUIRED_HEADER",
      message: `Missing required header: ${header}.`,
      field: header,
      severity: "error",
    });
  }

  const rawRows: RawCsvRow[] = dataRecords.map((record) => mapRecordToRawRow(headers, record));

  if (missingHeaders.length > 0) {
    return buildResult([], rawRows, warnings, errors);
  }

  const transactions: Transaction[] = [];
  const rowIssueIndexes: RowIssueIndexes = {
    warningRows: new Set<number>(),
    errorRows: new Set<number>(),
  };

  for (const row of rawRows) {
    const rowWarnings: ParserWarning[] = [];
    const rowErrors: ParserError[] = [];
    const invalidOptionalNumericFields = new Set<string>();
    const normalized = row.normalized;

    for (const field of REQUIRED_HEADERS) {
      if (normalized[field] === "") {
        rowErrors.push({
          code: "MISSING_REQUIRED_FIELD",
          message: `Missing required field: ${field}.`,
          rowNumber: row.rowNumber,
          field,
          severity: "error",
        });
      }
    }

    if (normalized.date && !isValidSupportedDate(normalized.date)) {
      rowErrors.push({
        code: "INVALID_DATE",
        message: "Date must be YYYY-MM-DD or an ISO timestamp ending with Z.",
        rowNumber: row.rowNumber,
        field: "date",
        value: normalized.date,
        severity: "error",
      });
    }

    for (const field of NUMERIC_FIELDS) {
      const value = normalized[field];
      if (!value) continue;
      if (!isValidNumber(value)) {
        if (field === "amount") {
          rowErrors.push({
            code: "INVALID_NUMBER",
            message: `Invalid numeric value for required field: ${field}.`,
            rowNumber: row.rowNumber,
            field,
            value,
            severity: "error",
          });
        } else if (OPTIONAL_NUMERIC_FIELDS.has(field)) {
          invalidOptionalNumericFields.add(field);
          rowWarnings.push({
            code: "INVALID_OPTIONAL_NUMBER",
            message: `Invalid numeric value for optional field: ${field}.`,
            rowNumber: row.rowNumber,
            field,
            value,
            severity: "warning",
          });
        }
      }
    }

    const normalizedType = normalizeTransactionType(normalized.type);
    if (normalized.type && normalizedType === "unknown" && normalized.type.toLowerCase() !== "unknown") {
      rowWarnings.push({
        code: "UNKNOWN_TRANSACTION_TYPE",
        message: `Unsupported transaction type classified as unknown: ${normalized.type}.`,
        rowNumber: row.rowNumber,
        field: "type",
        value: normalized.type,
        severity: "warning",
      });
    }

    warnings.push(...rowWarnings);
    errors.push(...rowErrors);
    if (rowWarnings.length > 0) rowIssueIndexes.warningRows.add(row.rowNumber);
    if (rowErrors.length > 0) rowIssueIndexes.errorRows.add(row.rowNumber);

    row.status = getRowStatus(rowWarnings, rowErrors);
    if (rowErrors.length === 0) {
      transactions.push(toTransaction(row, normalizedType, options, invalidOptionalNumericFields));
    }
  }

  return buildResult(transactions, rawRows, warnings, errors, rowIssueIndexes);
}

function parseCsvRecords(csv: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let rowNumber = 1;
  let current = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index] ?? "";
    const nextChar = csv[index + 1] ?? "";

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      currentRow.push(current);
      records.push({ rowNumber, cells: currentRow });
      currentRow = [];
      current = "";
      if (char === "\r" && nextChar === "\n") index += 1;
      rowNumber += 1;
      continue;
    }

    current += char;
  }

  if (current !== "" || currentRow.length > 0) {
    currentRow.push(current);
    records.push({ rowNumber, cells: currentRow });
  }

  return records.filter((record) => record.cells.some((cell) => cell.trim() !== ""));
}

function mapRecordToRawRow(headers: string[], record: CsvRecord): RawCsvRow {
  const raw: Record<string, string> = {};
  const normalized: Record<string, string> = {};

  headers.forEach((header, index) => {
    const rawValue = record.cells[index] ?? "";
    raw[header] = rawValue;
    normalized[header] = rawValue.trim();
  });

  if (record.cells.length > headers.length) {
    const extras = record.cells.slice(headers.length);
    raw.__extra = extras.join(",");
    normalized.__extra = extras.map((value) => value.trim()).join(",");
  }

  for (const header of KNOWN_HEADERS) {
    raw[header] ??= "";
    normalized[header] ??= "";
  }

  return {
    rowNumber: record.rowNumber,
    raw,
    normalized,
    status: "ok",
  };
}

function isValidSupportedDate(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  if (/^\d{4}-\d{2}-\d{2}T.+Z$/.test(value)) {
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,
    );
    if (!match) return false;
    const [, rawYear, rawMonth, rawDay, rawHour, rawMinute, rawSecond] = match;
    const year = Number(rawYear);
    const month = Number(rawMonth);
    const day = Number(rawDay);
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    const second = Number(rawSecond);
    const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day &&
      parsed.getUTCHours() === hour &&
      parsed.getUTCMinutes() === minute &&
      parsed.getUTCSeconds() === second
    );
  }

  return false;
}

function isValidNumber(value: string): boolean {
  return /^-?(?:\d+|\d*\.\d+)$/.test(value.trim()) && Number.isFinite(Number(value));
}

function normalizeTransactionType(value: string): TransactionType {
  const type = value.trim().toLowerCase();
  if (ALLOWED_TRANSACTION_TYPES.has(type as TransactionType)) {
    return type as TransactionType;
  }
  return "unknown";
}

function getRowStatus(warnings: ParserWarning[], errors: ParserError[]): RawCsvRowStatus {
  if (errors.length > 0) return "error";
  if (warnings.length > 0) return "warning";
  return "ok";
}

function toTransaction(
  row: RawCsvRow,
  type: TransactionType,
  options: ParseUniversalCsvOptions,
  invalidOptionalNumericFields: Set<string>,
): Transaction {
  const value = (field: string): string => row.normalized[field] ?? "";
  const optional = (field: string): string | undefined => {
    if (invalidOptionalNumericFields.has(field)) return undefined;
    const result = value(field);
    return result === "" ? undefined : result;
  };

  return {
    id: `universal-row-${row.rowNumber}`,
    date: value("date"),
    timestamp: value("date"),
    type,
    asset: value("asset"),
    amount: value("amount"),
    price: optional("price"),
    fiatValue: optional("fiat_value"),
    fiatCurrency: optional("fiat_currency"),
    feeAmount: optional("fee"),
    feeAsset: optional("fee_asset"),
    txHash: optional("tx_hash"),
    orderId: optional("order_id"),
    counterparty: optional("counterparty"),
    source: optional("source") ?? options.sourceName,
    notes: optional("notes"),
    rawRowNumber: row.rowNumber,
    originalType: value("type"),
  };
}

function buildResult(
  transactions: Transaction[],
  rawRows: RawCsvRow[],
  warnings: ParserWarning[],
  errors: ParserError[],
  rowIssueIndexes?: RowIssueIndexes,
): ParseUniversalCsvResult {
  const warningRows = rowIssueIndexes?.warningRows.size ?? 0;
  const errorRows =
    rowIssueIndexes?.errorRows.size ??
    new Set(errors.map((error) => error.rowNumber).filter((row): row is number => row !== undefined))
      .size;
  const parsedRows = rawRows.filter((row) => row.status !== "error").length;
  const summary: ParserSummary = {
    totalRows: rawRows.length,
    parsedRows,
    warningRows,
    errorRows,
    transactionCount: transactions.length,
    warningCount: warnings.length,
    errorCount: errors.length,
  };

  return {
    transactions,
    rawRows,
    warnings,
    errors,
    summary,
  };
}
