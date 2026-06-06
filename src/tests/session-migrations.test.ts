import { describe, expect, it } from "vitest";
import { createVersionedImportSession, type ImportSessionPayload } from "@/lib/client/session-schema";
import { migrateImportSession, normalizeImportSession } from "@/lib/client/session-migrations";

const payload: ImportSessionPayload = {
  version: 1,
  savedAt: "2026-06-06T00:00:00.000Z",
  fileName: "sample.csv",
  parserSummary: {
    totalRows: 2,
    parsedRows: 2,
    warningRows: 0,
    errorRows: 0,
    transactionCount: 2,
    warningCount: 0,
    errorCount: 0,
  },
  transactions: [],
  parserWarnings: [],
  parserErrors: [],
  rawRows: [],
  riskResult: {
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
  },
};

describe("migrateImportSession", () => {
  it("returns current schema normalized", () => {
    const envelope = createVersionedImportSession(payload);
    const migrated = migrateImportSession(envelope);

    expect(migrated).toEqual(envelope);
  });

  it("wraps old unversioned session shape", () => {
    const migrated = migrateImportSession(payload);

    expect(migrated).not.toBeNull();
    expect(migrated?.schemaVersion).toBe(1);
    expect(migrated?.savedAt).toBe(payload.savedAt);
    expect(migrated?.payload).toEqual(payload);
  });

  it("adds safe defaults for missing optional fields", () => {
    const { parserWarnings, parserErrors, rawRows, fileName, savedAt, version, ...minimalPayload } = payload;
    const migrated = migrateImportSession(minimalPayload);

    expect(migrated).not.toBeNull();
    expect(migrated?.payload.version).toBe(version);
    expect(typeof migrated?.payload.savedAt).toBe("string");
    expect(migrated?.payload.fileName).toBeNull();
    expect(migrated?.payload.parserWarnings).toEqual(parserWarnings);
    expect(migrated?.payload.parserErrors).toEqual(parserErrors);
    expect(migrated?.payload.rawRows).toEqual(rawRows);
    expect(migrated?.payload.partnerAttribution).toBeUndefined();
    expect(fileName).toBe("sample.csv");
    expect(savedAt).toBe("2026-06-06T00:00:00.000Z");
  });

  it("returns null for invalid object", () => {
    expect(migrateImportSession({})).toBeNull();
    expect(migrateImportSession({ ...payload, parserSummary: null })).toBeNull();
    expect(migrateImportSession({ ...payload, transactions: null })).toBeNull();
    expect(migrateImportSession({ ...payload, riskResult: null })).toBeNull();
  });

  it("returns null for unknown future schemaVersion", () => {
    expect(
      migrateImportSession({
        schemaVersion: 999,
        savedAt: payload.savedAt,
        payload,
      }),
    ).toBeNull();
  });
});

describe("normalizeImportSession", () => {
  it("normalizes through migration behavior", () => {
    const normalized = normalizeImportSession(payload);

    expect(normalized?.schemaVersion).toBe(1);
    expect(normalized?.payload.fileName).toBe("sample.csv");
  });
});
