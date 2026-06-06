import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearManualCostBasisEntry,
  loadManualCostBasisEntries,
  saveManualCostBasisEntries,
  saveManualCostBasisEntry,
} from "@/lib/client/manual-cost-basis-storage";

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: new MemoryStorage(),
    },
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("manual cost basis storage", () => {
  it("loads an empty map when storage has no entries", () => {
    expect(loadManualCostBasisEntries()).toEqual({});
  });

  it("saves and loads manual cost basis entries", () => {
    saveManualCostBasisEntry({
      transactionId: "sell-1",
      costBasisFiat: "600",
      fiatCurrency: "USD",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(loadManualCostBasisEntries()).toEqual({
      "sell-1": {
        transactionId: "sell-1",
        costBasisFiat: "600",
        fiatCurrency: "USD",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
  });

  it("clears a single manual cost basis entry", () => {
    saveManualCostBasisEntries({
      "sell-1": {
        transactionId: "sell-1",
        costBasisFiat: "600",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      "sell-2": {
        transactionId: "sell-2",
        costBasisFiat: "800",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    clearManualCostBasisEntry("sell-1");

    expect(Object.keys(loadManualCostBasisEntries())).toEqual(["sell-2"]);
  });

  it("ignores malformed persisted entries", () => {
    saveManualCostBasisEntries({
      "sell-1": {
        transactionId: "different-id",
        costBasisFiat: "600",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(loadManualCostBasisEntries()).toEqual({});
  });
});
