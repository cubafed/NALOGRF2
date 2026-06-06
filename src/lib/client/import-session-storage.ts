import type { ParseUniversalCsvResult, ParserSummary, ParserWarning, ParserError, RawCsvRow } from "@/lib/parsers/parser-types";
import type { RiskEngineResult } from "@/lib/risk/risk-types";
import type { Transaction } from "@/lib/domain/types";
import {
  createVersionedImportSession,
  type ImportSessionPayload,
  type VersionedImportSession,
} from "@/lib/client/session-schema";
import { migrateImportSession } from "@/lib/client/session-migrations";

export interface ImportSession extends ImportSessionPayload {
  version: 1;
  savedAt: string;
  fileName: string | null;
  parserSummary: ParserSummary;
  transactions: Transaction[];
  parserWarnings: ParserWarning[];
  parserErrors: ParserError[];
  rawRows: RawCsvRow[];
  riskResult: RiskEngineResult;
}

const STORAGE_KEY = "crypto_audit_latest_import_v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveLatestImportSession(session: ImportSession): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const versionedSession = createVersionedImportSession(session, session.savedAt);
    storage.setItem(STORAGE_KEY, JSON.stringify(versionedSession));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function loadLatestVersionedImportSession(): VersionedImportSession | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return migrateImportSession(parsed);
  } catch {
    return null;
  }
}

export function loadLatestImportSession(): ImportSession | null {
  return loadLatestVersionedImportSession()?.payload ?? null;
}

export function clearLatestImportSession(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}

export function buildImportSession(
  fileName: string | null,
  parserResult: ParseUniversalCsvResult,
  riskResult: RiskEngineResult,
): ImportSession {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    fileName,
    parserSummary: parserResult.summary,
    transactions: parserResult.transactions,
    parserWarnings: parserResult.warnings,
    parserErrors: parserResult.errors,
    rawRows: parserResult.rawRows,
    riskResult,
  };
}
