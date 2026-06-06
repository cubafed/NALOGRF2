import type { Transaction } from "@/lib/domain/types";
import type { RawCsvRow } from "@/lib/parsers/parser-types";
import type { ParserWarning, ParserError } from "@/lib/parsers/parser-types";
import type { DataCompletenessResult } from "./analytics-types";

function isDateParseable(raw: string | undefined): boolean {
  if (!raw) return false;
  return /^\d{4}-\d{2}/.test(raw);
}

export function calculateDataCompleteness(params: {
  rawRows: RawCsvRow[];
  parserWarnings: ParserWarning[];
  parserErrors: ParserError[];
  transactions: Transaction[];
}): DataCompletenessResult {
  const { rawRows, parserWarnings, parserErrors, transactions } = params;

  const totalRows = rawRows.length;
  const warningRows = parserWarnings.length;
  const errorRows = parserErrors.length;
  const completeRows = Math.max(0, totalRows - warningRows - errorRows);

  let missingFiatValueRows = 0;
  let missingAmountRows = 0;
  let invalidDateRows = 0;
  let unknownTypeRows = 0;

  for (const tx of transactions) {
    if (tx.fiatValue === null || tx.fiatValue === undefined || tx.fiatValue === "") {
      missingFiatValueRows++;
    }
    if (!tx.amount || tx.amount === "0") {
      missingAmountRows++;
    }
    if (!isDateParseable(tx.date) && !isDateParseable(tx.timestamp)) {
      invalidDateRows++;
    }
    if (tx.type === "unknown") {
      unknownTypeRows++;
    }
  }

  const completenessPercent =
    totalRows === 0 ? 100 : Math.round((completeRows / totalRows) * 100);

  return {
    totalRows,
    completeRows,
    warningRows,
    errorRows,
    missingFiatValueRows,
    missingAmountRows,
    invalidDateRows,
    unknownTypeRows,
    completenessPercent,
  };
}
