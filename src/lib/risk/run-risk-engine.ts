import type { FindingSeverity } from "@/lib/domain/types";
import { calculateReadinessScore, getReadinessLabel } from "@/lib/risk/calculate-readiness-score";
import { riskRules } from "@/lib/risk/risk-rules";
import type { RiskEngineOptions, RiskEngineResult, RiskSummary } from "@/lib/risk/risk-types";
import type { Transaction } from "@/lib/domain/types";

const defaultOptions: Required<RiskEngineOptions> = {
  largeP2pInflowThreshold: 5000,
  criticalP2pInflowThreshold: 7000,
  largeFiatWithdrawalThreshold: 3000,
  criticalFiatWithdrawalThreshold: 10000,
  rapidTransitWindowDays: 3,
  rapidTransitThreshold: 5000,
  concentratedCounterpartyVolumeThreshold: 10000,
  concentratedCounterpartyCountThreshold: 5,
  highP2pShareRatio: 0.5,
  highP2pShareMinVolume: 5000,
};

export function runRiskEngine(
  transactions: Transaction[],
  options: RiskEngineOptions = {},
): RiskEngineResult {
  const resolvedOptions = { ...defaultOptions, ...options };
  const findings = riskRules.flatMap((rule) =>
    rule({
      transactions,
      options: resolvedOptions,
    }),
  );
  const readinessScore = calculateReadinessScore(findings);

  return {
    findings,
    summary: summarizeFindings(findings),
    readinessScore,
    readinessLabel: getReadinessLabel(readinessScore),
  };
}

function summarizeFindings(findings: RiskEngineResult["findings"]): RiskSummary {
  const severityCount = (severity: FindingSeverity) =>
    findings.filter((finding) => finding.severity === severity).length;
  const affectedTransactionIds = new Set(
    findings.flatMap((finding) => finding.affectedTransactionIds),
  );

  return {
    totalFindings: findings.length,
    criticalCount: severityCount("critical"),
    mediumCount: severityCount("medium"),
    lowCount: severityCount("low"),
    affectedTransactionCount: affectedTransactionIds.size,
    rulesTriggered: findings.map((finding) => finding.ruleId),
  };
}
