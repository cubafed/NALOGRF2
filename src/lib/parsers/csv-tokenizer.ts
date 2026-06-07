/**
 * Shared CSV tokenizer. Handles quoted fields, escaped quotes (""), and CRLF/CR/LF
 * line endings. Used by the universal CSV parser and by exchange import adapters so
 * the same RFC-4180-style tokenization is applied everywhere (no duplicated logic).
 */

export interface CsvRecord {
  rowNumber: number;
  cells: string[];
}

/** Tokenize raw CSV text into records, dropping fully blank rows. */
export function tokenizeCsv(csv: string): CsvRecord[] {
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

/**
 * Tokenize CSV and return the header row plus each data row as a header→value object.
 * Header cells are trimmed. Useful for adapters that map exchange columns by name.
 */
export function parseCsvToObjects(csv: string): {
  headers: string[];
  rows: { rowNumber: number; values: Record<string, string> }[];
} {
  const records = tokenizeCsv(csv);
  const [headerRecord, ...dataRecords] = records;
  if (!headerRecord) return { headers: [], rows: [] };

  const headers = headerRecord.cells.map((header) => header.trim());
  const rows = dataRecords.map((record) => {
    const values: Record<string, string> = {};
    headers.forEach((header, index) => {
      values[header] = (record.cells[index] ?? "").trim();
    });
    return { rowNumber: record.rowNumber, values };
  });

  return { headers, rows };
}
