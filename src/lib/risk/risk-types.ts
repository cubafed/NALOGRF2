import type { FindingSeverity, Transaction } from "@/lib/domain/types";

export interface RiskEngineOptions {
  largeP2pInflowThreshold?: number;
  criticalP2pInflowThreshold?: number;
  largeFiatWithdrawalThreshold?: number;
  criticalFiatWithdrawalThreshold?: number;
  /** RU bank-trigger rules (115-ФЗ context). */
  rapidTransitWindowDays?: number;
  rapidTransitThreshold?: number;
  concentratedCounterpartyVolumeThreshold?: number;
  concentratedCounterpartyCountThreshold?: number;
  highP2pShareRatio?: number;
  highP2pShareMinVolume?: number;
}

export type ReadinessLabel = "good" | "needs_review" | "high_risk";

export interface RiskFinding {
  id: string;
  ruleId: string;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendedAction: string;
  documentsNeeded: string[];
  affectedTransactionIds: string[];
  affectedRawRowNumbers: number[];
  status: "open";
  createdBy: "risk_engine_v1";
}

export interface RiskSummary {
  totalFindings: number;
  criticalCount: number;
  mediumCount: number;
  lowCount: number;
  affectedTransactionCount: number;
  rulesTriggered: string[];
}

export interface RiskEngineResult {
  findings: RiskFinding[];
  summary: RiskSummary;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
}

export interface RiskRuleContext {
  transactions: readonly Transaction[];
  options: Required<RiskEngineOptions>;
}

export type RiskRule = (context: RiskRuleContext) => RiskFinding[];
