import { describe, it, expect } from "vitest";
import { calculateDataCompleteness } from "@/lib/metrics/calculate-data-completeness";
import type { Transaction } from "@/lib/domain/types";
import type { RawCsvRow, ParserWarning, ParserError } from "@/lib/parsers/parser-types";

function tx(overrides: Partial<Transaction>): Transaction {
  return { id: "tx-1", type: "buy", asset: "BTC", amount: "1", date: "2024-03-01", ...overrides };
}

function rawRow(rowNumber: number, status: RawCsvRow["status"] = "ok"): RawCsvRow {
  return { rowNumber, raw: {}, normalized: {}, status };
}

function warning(rowNumber: number): ParserWarning {
  return { code: "UNKNOWN_TRANSACTION_TYPE", message: "warn", rowNumber, severity: "warning" };
}

function error(rowNumber: number): ParserError {
  return { code: "INVALID_DATE", message: "err", rowNumber, severity: "error" };
}

describe("calculateDataCompleteness", () => {
  it("returns 100% completeness and zeros for empty input", () => {
    const result = calculateDataCompleteness({
      rawRows: [],
      parserWarnings: [],
      parserErrors: [],
      transactions: [],
    });
    expect(result.completenessPercent).toBe(100);
    expect(result.totalRows).toBe(0);
    expect(result.completeRows).toBe(0);
  });

  it("counts complete rows as totalRows minus warnings minus errors", () => {
    const result = calculateDataCompleteness({
      rawRows: [rawRow(1), rawRow(2), rawRow(3), rawRow(4), rawRow(5)],
      parserWarnings: [warning(2)],
      parserErrors: [error(4)],
      transactions: [],
    });
    expect(result.totalRows).toBe(5);
    expect(result.warningRows).toBe(1);
    expect(result.errorRows).toBe(1);
    expect(result.completeRows).toBe(3);
    expect(result.completenessPercent).toBe(60);
  });

  it("counts warning rows from parserWarnings length", () => {
    const result = calculateDataCompleteness({
      rawRows: [rawRow(1), rawRow(2)],
      parserWarnings: [warning(1), warning(2)],
      parserErrors: [],
      transactions: [],
    });
    expect(result.warningRows).toBe(2);
  });

  it("counts error rows from parserErrors length", () => {
    const result = calculateDataCompleteness({
      rawRows: [rawRow(1)],
      parserWarnings: [],
      parserErrors: [error(1)],
      transactions: [],
    });
    expect(result.errorRows).toBe(1);
  });

  it("counts missingFiatValueRows from transactions with null/empty fiatValue", () => {
    const result = calculateDataCompleteness({
      rawRows: [],
      parserWarnings: [],
      parserErrors: [],
      transactions: [
        tx({ id: "a", fiatValue: null }),
        tx({ id: "b", fiatValue: "" }),
        tx({ id: "c", fiatValue: "100" }),
      ],
    });
    expect(result.missingFiatValueRows).toBe(2);
  });

  it("counts unknownTypeRows from transactions with type === 'unknown'", () => {
    const result = calculateDataCompleteness({
      rawRows: [],
      parserWarnings: [],
      parserErrors: [],
      transactions: [
        tx({ id: "a", type: "unknown" }),
        tx({ id: "b", type: "buy" }),
        tx({ id: "c", type: "unknown" }),
      ],
    });
    expect(result.unknownTypeRows).toBe(2);
  });

  it("counts invalidDateRows when both date and timestamp are missing/unparseable", () => {
    const result = calculateDataCompleteness({
      rawRows: [],
      parserWarnings: [],
      parserErrors: [],
      transactions: [
        tx({ id: "a", date: undefined, timestamp: undefined }),
        tx({ id: "b", date: "not-a-date", timestamp: undefined }),
        tx({ id: "c", date: "2024-03-01" }),
      ],
    });
    expect(result.invalidDateRows).toBe(2);
  });
});
