import { describe, expect, it } from "vitest";
import {
  CURRENT_IMPORT_SESSION_SCHEMA_VERSION,
  createVersionedImportSession,
  isVersionedImportSession,
  type ImportSessionPayload,
} from "@/lib/client/session-schema";

const payload: ImportSessionPayload = {
  version: 1,
  savedAt: "2026-06-06T00:00:00.000Z",
  fileName: "sample.csv",
  parserSummary: {
    totalRows: 1,
    parsedRows: 1,
    warningRows: 0,
    errorRows: 0,
    transactionCount: 1,
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

describe("createVersionedImportSession", () => {
  it("wraps payload with schemaVersion and savedAt", () => {
    const envelope = createVersionedImportSession(payload, "2026-06-06T01:00:00.000Z");

    expect(envelope.schemaVersion).toBe(CURRENT_IMPORT_SESSION_SCHEMA_VERSION);
    expect(envelope.savedAt).toBe("2026-06-06T01:00:00.000Z");
    expect(envelope.payload).toBe(payload);
  });
});

describe("isVersionedImportSession", () => {
  it("returns true for a valid current envelope", () => {
    const envelope = createVersionedImportSession(payload);

    expect(isVersionedImportSession(envelope)).toBe(true);
  });

  it("returns false for invalid objects", () => {
    expect(isVersionedImportSession(null)).toBe(false);
    expect(isVersionedImportSession({})).toBe(false);
    expect(isVersionedImportSession({ schemaVersion: 99, savedAt: payload.savedAt, payload })).toBe(false);
    expect(isVersionedImportSession({ schemaVersion: 1, savedAt: payload.savedAt })).toBe(false);
    expect(
      isVersionedImportSession({
        schemaVersion: 1,
        savedAt: payload.savedAt,
        payload: { ...payload, riskResult: null },
      }),
    ).toBe(false);
  });
});
