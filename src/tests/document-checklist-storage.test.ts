import { describe, it, expect, beforeEach } from "vitest";
import {
  loadCollectedKeys,
  saveCollectedKeys,
  clearCollectedKeys,
} from "@/lib/client/document-checklist-storage";

const STORAGE_KEY = "crypto_audit_document_checklist_v1";

function makeMockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
}

const localStorageMock = makeMockLocalStorage();

Object.defineProperty(global, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
});

describe("document-checklist-storage", () => {
  it("returns empty array when storage is empty", () => {
    expect(loadCollectedKeys()).toEqual([]);
  });

  it("round-trips keys through save and load", () => {
    saveCollectedKeys(["bank_statement", "sell_order"]);
    const loaded = loadCollectedKeys();
    expect(loaded).toContain("bank_statement");
    expect(loaded).toContain("sell_order");
    expect(loaded).toHaveLength(2);
  });

  it("clearCollectedKeys empties the storage", () => {
    saveCollectedKeys(["bank_statement"]);
    clearCollectedKeys();
    expect(loadCollectedKeys()).toEqual([]);
  });

  it("returns empty array on corrupted JSON", () => {
    localStorageMock.setItem(STORAGE_KEY, "NOT JSON{{{");
    expect(loadCollectedKeys()).toEqual([]);
  });

  it("returns empty array when version field is wrong", () => {
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, collectedKeys: ["x"] }),
    );
    expect(loadCollectedKeys()).toEqual([]);
  });

  it("returns empty array when collectedKeys is not an array", () => {
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, collectedKeys: "not-an-array" }),
    );
    expect(loadCollectedKeys()).toEqual([]);
  });

  it("filters out non-string entries from collectedKeys", () => {
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, collectedKeys: ["valid", 42, null, "also_valid"] }),
    );
    const loaded = loadCollectedKeys();
    expect(loaded).toEqual(["valid", "also_valid"]);
  });

  it("does not throw when localStorage throws on getItem", () => {
    const brokenStorage = {
      getItem: () => { throw new Error("quota"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("quota"); },
    };
    const originalWindow = global.window;
    global.window = { localStorage: brokenStorage } as unknown as Window & typeof globalThis;
    expect(() => loadCollectedKeys()).not.toThrow();
    expect(() => saveCollectedKeys(["x"])).not.toThrow();
    expect(() => clearCollectedKeys()).not.toThrow();
    expect(loadCollectedKeys()).toEqual([]);
    global.window = originalWindow;
  });

  it("does not throw when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    (global as Record<string, unknown>).window = undefined;
    expect(() => loadCollectedKeys()).not.toThrow();
    expect(() => saveCollectedKeys(["x"])).not.toThrow();
    expect(() => clearCollectedKeys()).not.toThrow();
    expect(loadCollectedKeys()).toEqual([]);
    global.window = originalWindow;
  });
});
