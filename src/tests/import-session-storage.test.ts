import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveLatestImportSession,
  loadLatestImportSession,
  clearLatestImportSession,
  buildImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import type { ParseUniversalCsvResult } from "@/lib/parsers/parser-types";
import type { RiskEngineResult } from "@/lib/risk/risk-types";

const mockParserResult: ParseUniversalCsvResult = {
  transactions: [],
  rawRows: [],
  warnings: [],
  errors: [],
  summary: {
    totalRows: 0,
    parsedRows: 0,
    warningRows: 0,
    errorRows: 0,
    transactionCount: 0,
    warningCount: 0,
    errorCount: 0,
  },
};

const mockRiskResult: RiskEngineResult = {
  findings: [],
  summary: {
    totalFindings: 0,
    criticalCount: 0,
    mediumCount: 0,
    lowCount: 0,
    affectedTransactionCount: 0,
    rulesTriggered: [],
  },
  readinessScore: 100,
  readinessLabel: "good",
};

const mockSession: ImportSession = {
  version: 1,
  savedAt: "2024-01-01T00:00:00.000Z",
  fileName: "test.csv",
  parserSummary: mockParserResult.summary,
  transactions: [],
  parserWarnings: [],
  parserErrors: [],
  rawRows: [],
  riskResult: mockRiskResult,
};

// Simple sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, "window", {
  value: { sessionStorage: sessionStorageMock },
  writable: true,
});

beforeEach(() => {
  sessionStorageMock.clear();
});

describe("saveLatestImportSession / loadLatestImportSession", () => {
  it("saves and loads a valid session", () => {
    saveLatestImportSession(mockSession);
    const loaded = loadLatestImportSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe(1);
    expect(loaded?.fileName).toBe("test.csv");
    expect(loaded?.readinessScore).toBeUndefined(); // not on session root
    expect(loaded?.riskResult.readinessScore).toBe(100);
  });

  it("returns null when no session exists", () => {
    const loaded = loadLatestImportSession();
    expect(loaded).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    sessionStorageMock.setItem("crypto_audit_latest_import_v1", "not-valid-json{{");
    const loaded = loadLatestImportSession();
    expect(loaded).toBeNull();
  });

  it("returns null when version is wrong", () => {
    sessionStorageMock.setItem(
      "crypto_audit_latest_import_v1",
      JSON.stringify({ version: 2, savedAt: "x" }),
    );
    const loaded = loadLatestImportSession();
    expect(loaded).toBeNull();
  });
});

describe("clearLatestImportSession", () => {
  it("removes stored session", () => {
    saveLatestImportSession(mockSession);
    clearLatestImportSession();
    const loaded = loadLatestImportSession();
    expect(loaded).toBeNull();
  });
});

describe("buildImportSession", () => {
  it("builds a session with version 1 and savedAt", () => {
    const session = buildImportSession("my.csv", mockParserResult, mockRiskResult);
    expect(session.version).toBe(1);
    expect(session.fileName).toBe("my.csv");
    expect(session.riskResult).toBe(mockRiskResult);
    expect(typeof session.savedAt).toBe("string");
  });

  it("accepts null fileName", () => {
    const session = buildImportSession(null, mockParserResult, mockRiskResult);
    expect(session.fileName).toBeNull();
  });
});

describe("storage unavailable", () => {
  it("does not crash when sessionStorage is completely missing from window", () => {
    const originalStorage = (global.window as { sessionStorage?: unknown }).sessionStorage;
    // Simulate missing sessionStorage by making it throw on access
    Object.defineProperty(global.window, "sessionStorage", {
      get() { throw new Error("no storage"); },
      configurable: true,
    });
    expect(() => saveLatestImportSession(mockSession)).not.toThrow();
    expect(loadLatestImportSession()).toBeNull();
    expect(() => clearLatestImportSession()).not.toThrow();
    Object.defineProperty(global.window, "sessionStorage", {
      value: originalStorage,
      configurable: true,
      writable: true,
    });
  });

  it("does not crash when sessionStorage throws", () => {
    const brokenStorage = {
      getItem: () => { throw new Error("quota"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("quota"); },
    };
    const originalWindow = global.window;
    global.window = { sessionStorage: brokenStorage } as unknown as Window & typeof globalThis;
    expect(() => saveLatestImportSession(mockSession)).not.toThrow();
    expect(loadLatestImportSession()).toBeNull();
    expect(() => clearLatestImportSession()).not.toThrow();
    global.window = originalWindow;
  });
});
