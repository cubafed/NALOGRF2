import { describe, it, expect } from "vitest";
import { calculateSourceCoverage } from "@/lib/metrics/calculate-source-coverage";
import type { Transaction } from "@/lib/domain/types";

function tx(overrides: Partial<Transaction>): Transaction {
  return { id: "tx-1", type: "buy", asset: "BTC", amount: "1", ...overrides };
}

describe("calculateSourceCoverage", () => {
  it("groups transaction counts by source", () => {
    const result = calculateSourceCoverage({
      transactions: [
        tx({ id: "a", source: "Binance" }),
        tx({ id: "b", source: "Binance" }),
        tx({ id: "c", source: "Kraken" }),
      ],
      parserWarnings: [],
      parserErrors: [],
    });
    const binance = result.entries.find((e) => e.source === "Binance");
    const kraken = result.entries.find((e) => e.source === "Kraken");
    expect(binance?.transactionCount).toBe(2);
    expect(kraken?.transactionCount).toBe(1);
  });

  it("buckets null/empty source as Неизвестный источник", () => {
    const result = calculateSourceCoverage({
      transactions: [
        tx({ id: "a", source: undefined }),
        tx({ id: "b", source: "" }),
        tx({ id: "c", source: "   " }),
      ],
      parserWarnings: [],
      parserErrors: [],
    });
    expect(result.unknownSourceCount).toBe(3);
    const unknown = result.entries.find((e) => e.source === "Неизвестный источник");
    expect(unknown?.transactionCount).toBe(3);
  });

  it("calculates percent of total correctly", () => {
    const result = calculateSourceCoverage({
      transactions: [
        tx({ id: "a", source: "A" }),
        tx({ id: "b", source: "A" }),
        tx({ id: "c", source: "A" }),
        tx({ id: "d", source: "B" }),
      ],
      parserWarnings: [],
      parserErrors: [],
    });
    const a = result.entries.find((e) => e.source === "A");
    expect(a?.percent).toBe(75);
    const b = result.entries.find((e) => e.source === "B");
    expect(b?.percent).toBe(25);
  });

  it("sorts entries by transactionCount descending", () => {
    const result = calculateSourceCoverage({
      transactions: [
        tx({ id: "a", source: "X" }),
        tx({ id: "b", source: "Y" }),
        tx({ id: "c", source: "Y" }),
        tx({ id: "d", source: "Y" }),
        tx({ id: "e", source: "Z" }),
        tx({ id: "f", source: "Z" }),
      ],
      parserWarnings: [],
      parserErrors: [],
    });
    expect(result.entries[0].source).toBe("Y");
    expect(result.entries[1].source).toBe("Z");
    expect(result.entries[2].source).toBe("X");
  });
});
