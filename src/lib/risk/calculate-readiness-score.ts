import type { ReadinessLabel, RiskFinding } from "@/lib/risk/risk-types";

const severityPenalty = {
  critical: 10,
  medium: 4,
  low: 1,
} as const;

export function calculateReadinessScore(findings: readonly RiskFinding[]): number {
  const penalty = findings.reduce((total, finding) => total + severityPenalty[finding.severity], 0);
  return clamp(100 - penalty, 0, 100);
}

export function getReadinessLabel(score: number): ReadinessLabel {
  if (score >= 80) return "good";
  if (score >= 50) return "needs_review";
  return "high_risk";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
