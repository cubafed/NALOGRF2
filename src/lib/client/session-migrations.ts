import {
  CURRENT_IMPORT_SESSION_SCHEMA_VERSION,
  createVersionedImportSession,
  isVersionedImportSession,
  type ImportSessionPayload,
  type VersionedImportSession,
} from "@/lib/client/session-schema";
import type { PartnerAttribution } from "@/lib/partners/partner-types";

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

function isParserSummaryLike(value: unknown): boolean {
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

function isRiskSummaryLike(value: unknown): boolean {
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

function isRiskResultLike(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    Array.isArray(value.findings) &&
    isRiskSummaryLike(value.summary) &&
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

function normalizePayload(value: unknown, fallbackSavedAt?: string): ImportSessionPayload | null {
  if (!isRecord(value)) return null;

  if ("version" in value && value.version !== 1) {
    return null;
  }

  if (!isParserSummaryLike(value.parserSummary)) {
    return null;
  }

  if (!Array.isArray(value.transactions)) {
    return null;
  }

  if (!isRiskResultLike(value.riskResult)) {
    return null;
  }

  const savedAt =
    typeof value.savedAt === "string"
      ? value.savedAt
      : fallbackSavedAt ?? new Date().toISOString();
  const fileName = isStringOrNull(value.fileName) ? value.fileName : null;
  const payload: ImportSessionPayload = {
    version: 1,
    savedAt,
    fileName,
    parserSummary: value.parserSummary,
    transactions: value.transactions,
    parserWarnings: Array.isArray(value.parserWarnings) ? value.parserWarnings : [],
    parserErrors: Array.isArray(value.parserErrors) ? value.parserErrors : [],
    rawRows: Array.isArray(value.rawRows) ? value.rawRows : [],
    riskResult: value.riskResult,
  } as ImportSessionPayload;

  if (isPartnerAttribution(value.partnerAttribution)) {
    payload.partnerAttribution = value.partnerAttribution;
  } else if (value.partnerAttribution === null) {
    payload.partnerAttribution = null;
  }

  return payload;
}

export function migrateImportSession(value: unknown): VersionedImportSession | null {
  if (!isRecord(value)) {
    return null;
  }

  if ("schemaVersion" in value) {
    if (value.schemaVersion !== CURRENT_IMPORT_SESSION_SCHEMA_VERSION) {
      return null;
    }

    if (!isVersionedImportSession(value)) {
      if (typeof value.savedAt !== "string") {
        return null;
      }

      const payload = normalizePayload(value.payload, value.savedAt);
      if (!payload) {
        return null;
      }

      return createVersionedImportSession(payload, value.savedAt);
    }

    return createVersionedImportSession(
      normalizePayload(value.payload, value.savedAt) ?? value.payload,
      value.savedAt,
    );
  }

  const payload = normalizePayload(value);
  return payload ? createVersionedImportSession(payload, payload.savedAt) : null;
}

export function normalizeImportSession(value: unknown): VersionedImportSession | null {
  return migrateImportSession(value);
}
