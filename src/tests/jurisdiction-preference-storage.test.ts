import { describe, it, expect, beforeEach } from "vitest";
import {
  loadJurisdictionPreference,
  saveJurisdictionPreference,
  hasJurisdictionPreference,
} from "@/lib/client/jurisdiction-preference-storage";

// Simple localStorage mock (the test environment is "node").
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
});

describe("jurisdiction-preference-storage", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("defaults to ru_resident with nothing stored", () => {
    expect(loadJurisdictionPreference()).toBe("ru_resident");
    expect(hasJurisdictionPreference()).toBe(false);
  });

  it("persists and reloads a valid available jurisdiction", () => {
    saveJurisdictionPreference("ru_nonresident");
    expect(loadJurisdictionPreference()).toBe("ru_nonresident");
    expect(hasJurisdictionPreference()).toBe(true);
  });

  it("ignores planned-only or unknown codes", () => {
    saveJurisdictionPreference("us"); // planned
    expect(loadJurisdictionPreference()).toBe("ru_resident");
    saveJurisdictionPreference("nope"); // unknown
    expect(loadJurisdictionPreference()).toBe("ru_resident");
    expect(hasJurisdictionPreference()).toBe(false);
  });

  it("falls back to default if a planned code was somehow stored", () => {
    localStorageMock.setItem("crypto_audit_jurisdiction_v1", "us");
    expect(loadJurisdictionPreference()).toBe("ru_resident");
    expect(hasJurisdictionPreference()).toBe(false);
  });
});
