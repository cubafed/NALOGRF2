/** A chat turn between the user and the AI advisor. */
export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

/** One deterministic review finding, summarized for the advisor context. */
export interface AssistantFindingSummary {
  ruleId: string;
  title: string;
  severity: string;
  count: number;
}

/**
 * Deterministic snapshot handed to the advisor as context. Every number here is
 * produced by the deterministic engine (tax/risk), never by the AI. The advisor may
 * explain and reference these figures but must never compute or alter them.
 */
export interface AssistantContext {
  periodLabel?: string;
  readinessScore?: number;
  findings: AssistantFindingSummary[];
  /** Optional preliminary tax snapshot (all figures from the deterministic engine). */
  tax?: {
    reportCurrency: string;
    taxableBaseReport: number;
    taxAmountReport: number;
    includedCount: number;
    needsReviewCount: number;
  };
}

/** Request body POSTed to /api/assistant. */
export interface AssistantRequest {
  messages: AssistantMessage[];
  context: AssistantContext;
}
