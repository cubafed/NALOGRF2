import type { Transaction } from "@/lib/domain/types";
import type {
  ParserError,
  ParserSummary,
  ParserWarning,
  RawCsvRow,
} from "@/lib/parsers/parser-types";
import type { PartnerAttribution } from "@/lib/partners/partner-types";
import type { RiskEngineResult } from "@/lib/risk/risk-types";

export const CURRENT_IMPORT_SESSION_SCHEMA_VERSION = 1;

export interface ImportSessionPayload {
  version: 1;
  savedAt: string;
  fileName: string | null;
  parserSummary: ParserSummary;
  transactions: Transaction[];
  parserWarnings: ParserWarning[];
  parserErrors: ParserError[];
  rawRows: RawCsvRow[];
  riskResult: RiskEngineResult;
  partnerAttribution?: PartnerAttribution | null;
}

export interface VersionedImportSession {
  schemaVersion: typeof CURRENT_IMPORT_SESSION_SCHEMA_VERSION;
  savedAt: string;
  payload: ImportSessionPayload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isParserSummary(value: unknown): value is ParserSummary {
  if (!isRecord(value)) return false;

  return (
    isNumber(value.totalRows) &&
    isNumber(value.parsedRows) &&
    isNumber(value.warningRows) &&
    isNumber(value.errorRows) &&
    isNumber(value.transactionCount) &&
    isNumber(value.warningCount) &&
    isNumber(value.errorCount)
  );
}

function isRiskSummary(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    isNumber(value.totalFindings) &&
    isNumber(value.criticalCount) &&
    isNumber(value.mediumCount) &&
    isNumber(value.lowCount) &&
    isNumber(value.affectedTransactionCount) &&
    isStringArray(value.rulesTriggered)
  );
}

function isRiskEngineResult(value: unknown): value is RiskEngineResult {
  if (!isRecord(value)) return false;

  return (
    Array.isArray(value.findings) &&
    isRiskSummary(value.summary) &&
    isNumber(value.readinessScore) &&
    (value.readinessLabel === "good" ||
      value.readinessLabel === "needs_review" ||
      value.readinessLabel === "high_risk")
  );
}

function isPartnerAttribution(value: unknown): value is PartnerAttribution {
  if (!isRecord(value)) return false;

  return (
    isStringOrNull(value.partner) &&
    isStringOrNull(value.ref) &&
    isStringOrNull(value.utmSource) &&
    isStringOrNull(value.utmMedium) &&
    isStringOrNull(value.utmCampaign) &&
    isStringOrNull(value.utmContent) &&
    isStringOrNull(value.utmTerm) &&
    typeof value.capturedAt === "string" &&
    typeof value.landingPath === "string"
  );
}

export function isImportSessionPayload(value: unknown): value is ImportSessionPayload {
  if (!isRecord(value)) return false;

  if ("version" in value && value.version !== 1) {
    return false;
  }

  if (
    "partnerAttribution" in value &&
    value.partnerAttribution !== null &&
    value.partnerAttribution !== undefined &&
    !isPartnerAttribution(value.partnerAttribution)
  ) {
    return false;
  }

  return (
    typeof value.savedAt === "string" &&
    isStringOrNull(value.fileName) &&
    isParserSummary(value.parserSummary) &&
    Array.isArray(value.transactions) &&
    Array.isArray(value.parserWarnings) &&
    Array.isArray(value.parserErrors) &&
    Array.isArray(value.rawRows) &&
    isRiskEngineResult(value.riskResult)
  );
}

export function isVersionedImportSession(value: unknown): value is VersionedImportSession {
  if (!isRecord(value)) return false;

  return (
    value.schemaVersion === CURRENT_IMPORT_SESSION_SCHEMA_VERSION &&
    typeof value.savedAt === "string" &&
    isImportSessionPayload(value.payload)
  );
}

export function createVersionedImportSession(
  payload: ImportSessionPayload,
  savedAt = payload.savedAt || new Date().toISOString(),
): VersionedImportSession {
  return {
    schemaVersion: CURRENT_IMPORT_SESSION_SCHEMA_VERSION,
    savedAt,
    payload,
  };
}
