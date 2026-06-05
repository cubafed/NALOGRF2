import type {
  SavedReportDraft,
  SerializeReportSessionInput,
} from "@/lib/persistence/saved-report-types";

function buildFallbackTitle(savedAt: string): string {
  const timestamp = Date.parse(savedAt);

  if (Number.isNaN(timestamp)) {
    return "Crypto Audit Report";
  }

  return `Crypto Audit Report ${new Date(timestamp).toISOString().slice(0, 10)}`;
}

export function serializeReportSession({
  session,
  report,
  partnerAttribution = null,
}: SerializeReportSessionInput): SavedReportDraft {
  const title = session.fileName
    ? `Crypto Audit Report: ${session.fileName}`
    : buildFallbackTitle(session.savedAt);

  return {
    title,
    fileName: session.fileName,
    readinessScore: report.readinessScore,
    readinessLabel: report.readinessLabel,
    parserSummary: report.parserSummary,
    riskSummary: report.riskSummary,
    reportPreview: report,
    partnerAttribution,
    sourceType: "local_upload",
  };
}
