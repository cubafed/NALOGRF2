import { describe, expect, it } from "vitest";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";

describe("upload sample universal CSV", () => {
  it("can be parsed by the universal CSV parser", () => {
    const result = parseUniversalCsv(sampleUniversalCsv);

    expect(result.summary.totalRows).toBeGreaterThan(0);
    expect(result.rawRows.length).toBe(result.summary.totalRows);
  });

  it("produces at least one transaction", () => {
    const result = parseUniversalCsv(sampleUniversalCsv);

    expect(result.transactions.length).toBeGreaterThan(0);
  });

  it("produces at least one warning", () => {
    const result = parseUniversalCsv(sampleUniversalCsv);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((warning) => warning.code === "UNKNOWN_TRANSACTION_TYPE")).toBe(
      true,
    );
  });

  it("produces at least one error", () => {
    const result = parseUniversalCsv(sampleUniversalCsv);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((error) => error.code === "MISSING_REQUIRED_FIELD")).toBe(true);
  });
});
