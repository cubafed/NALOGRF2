import { describe, it, expect } from "vitest";
import { DOCUMENT_CATALOG, resolveDocument } from "@/lib/report/document-catalog";

const CATALOG_KEYS = new Set(DOCUMENT_CATALOG.map((e) => e.key));

const KNOWN_TOKENS = [
  "exchange trade history",
  "price source",
  "accountant note",
  "P2P order proof",
  "bank statement",
  "exchange statement",
  "sell order",
  "withdrawal record",
  "acquisition history",
  "wallet ownership note",
  "blockchain transaction link",
  "prior exchange withdrawal",
  "source row",
  "manual classification note",
  "earlier exchange history",
  "acquisition record",
  "wallet deposit history",
];

describe("document-catalog", () => {
  it("has no duplicate keys", () => {
    const keys = DOCUMENT_CATALOG.map((e) => e.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("every catalog entry has non-empty ru, en, key, category", () => {
    for (const entry of DOCUMENT_CATALOG) {
      expect(entry.key.length).toBeGreaterThan(0);
      expect(entry.ru.length).toBeGreaterThan(0);
      expect(entry.en.length).toBeGreaterThan(0);
      expect(entry.category.length).toBeGreaterThan(0);
    }
  });

  it("resolves all known risk-rules tokens to a catalog entry (not fallback)", () => {
    for (const token of KNOWN_TOKENS) {
      const entry = resolveDocument(token);
      expect(CATALOG_KEYS.has(entry.key)).toBe(true);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("resolveDocument is case-insensitive for known tokens", () => {
    const lower = resolveDocument("bank statement");
    const mixed = resolveDocument("Bank Statement");
    expect(lower.key).toBe(mixed.key);
  });

  it("unknown token returns deterministic fallback with same input as ru and en", () => {
    const token = "some unknown doc xyz";
    const a = resolveDocument(token);
    const b = resolveDocument(token);
    expect(a.key).toBe(b.key);
    expect(a.ru).toBe(token);
    expect(a.en).toBe(token);
    expect(a.category).toBe("other");
  });

  it("two different unknown tokens produce different keys", () => {
    const a = resolveDocument("unknown doc alpha");
    const b = resolveDocument("unknown doc beta");
    expect(a.key).not.toBe(b.key);
  });
});
