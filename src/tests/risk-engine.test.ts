import { describe, expect, it } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import { calculateReadinessScore, getReadinessLabel } from "@/lib/risk/calculate-readiness-score";
import { runRiskEngine } from "@/lib/risk/run-risk-engine";
import type { RiskFinding } from "@/lib/risk/risk-types";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    timestamp: "2024-03-14",
    type: "buy",
    asset: "BTC",
    amount: "1",
    fiatValue: "100",
    rawRowNumber: 2,
    ...overrides,
  };
}

function finding(severity: RiskFinding["severity"], id: string): RiskFinding {
  return {
    id,
    ruleId: id,
    severity,
    title: id,
    explanation: id,
    whyItMatters: id,
    recommendedAction: id,
    documentsNeeded: [],
    affectedTransactionIds: [],
    affectedRawRowNumbers: [],
    status: "open",
    createdBy: "risk_engine_v1",
  };
}

describe("runRiskEngine", () => {
  it("does not crash on empty transactions", () => {
    const result = runRiskEngine([]);

    expect(result.findings).toEqual([]);
    expect(result.readinessScore).toBe(100);
    expect(result.readinessLabel).toBe("good");
  });

  it("triggers large_p2p_inflow for p2p >= 5000", () => {
    const result = runRiskEngine([
      tx({ id: "p2p-1", type: "p2p", asset: "USDT", amount: "5000", fiatValue: "5000" }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "large_p2p_inflow",
        severity: "medium",
      }),
    );
  });

  it("triggers critical large_p2p_inflow for p2p >= 7000", () => {
    const result = runRiskEngine([
      tx({ id: "p2p-1", type: "p2p", asset: "USDT", amount: "8000", fiatValue: "8000" }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "large_p2p_inflow",
        severity: "critical",
      }),
    );
  });

  it("triggers large_fiat_withdrawal for withdrawal or sell >= 3000", () => {
    const result = runRiskEngine([
      tx({
        id: "withdrawal-1",
        type: "withdrawal",
        asset: "USD",
        amount: "3500",
        fiatValue: "3500",
      }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "large_fiat_withdrawal",
        severity: "medium",
      }),
    );
  });

  it("triggers unknown_source_wallet for deposit from unknown, external, or missing source", () => {
    const result = runRiskEngine([
      tx({
        id: "deposit-1",
        type: "deposit",
        asset: "USDT",
        amount: "10",
        fiatValue: "10",
        counterparty: "External wallet",
        source: "Manual",
      }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "unknown_source_wallet",
      }),
    );
  });

  it("triggers unknown_transaction_type for type unknown", () => {
    const result = runRiskEngine([
      tx({ id: "unknown-1", type: "unknown", asset: "USDT", amount: "10", fiatValue: "10" }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "unknown_transaction_type",
        severity: "low",
      }),
    );
  });

  it("triggers missing_fiat_value for missing fiatValue", () => {
    const result = runRiskEngine([
      tx({ id: "missing-fiat-1", type: "transfer", asset: "SOL", amount: "12", fiatValue: null }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: "missing_fiat_value",
        severity: "medium",
      }),
    );
  });

  it("triggers missing_cost_basis_basic when sell has no earlier acquisition", () => {
    const result = runRiskEngine([
      tx({ id: "sell-1", type: "sell", asset: "ETH", amount: "2", fiatValue: "7000" }),
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        id: "risk-missing_cost_basis_basic-ETH-2",
        ruleId: "missing_cost_basis_basic",
        severity: "critical",
      }),
    );
  });

  it("does not trigger missing_cost_basis_basic when buy exists before sell for same asset", () => {
    const result = runRiskEngine([
      tx({
        id: "buy-1",
        timestamp: "2024-03-01",
        type: "buy",
        asset: "ETH",
        amount: "2",
        fiatValue: "6000",
        rawRowNumber: 2,
      }),
      tx({
        id: "sell-1",
        timestamp: "2024-04-01",
        type: "sell",
        asset: "ETH",
        amount: "2",
        fiatValue: "7000",
        rawRowNumber: 3,
      }),
    ]);

    expect(result.findings.some((item) => item.ruleId === "missing_cost_basis_basic")).toBe(false);
  });

  it("calculates readiness score penalties and clamps to 0", () => {
    expect(
      calculateReadinessScore([
        finding("critical", "critical-1"),
        finding("medium", "medium-1"),
        finding("low", "low-1"),
      ]),
    ).toBe(85);
    expect(
      calculateReadinessScore(Array.from({ length: 11 }, (_, index) => finding("critical", `${index}`))),
    ).toBe(0);
  });

  it("returns readiness labels for score ranges", () => {
    expect(getReadinessLabel(80)).toBe("good");
    expect(getReadinessLabel(100)).toBe("good");
    expect(getReadinessLabel(50)).toBe("needs_review");
    expect(getReadinessLabel(79)).toBe("needs_review");
    expect(getReadinessLabel(0)).toBe("high_risk");
    expect(getReadinessLabel(49)).toBe("high_risk");
  });

  it("sample universal CSV produces at least three risk findings", () => {
    const parsed = parseUniversalCsv(sampleUniversalCsv);
    const result = runRiskEngine(parsed.transactions);

    expect(result.findings.length).toBeGreaterThanOrEqual(3);
    expect(result.summary.rulesTriggered).toEqual(
      expect.arrayContaining([
        "large_p2p_inflow",
        "large_fiat_withdrawal",
        "unknown_source_wallet",
        "unknown_transaction_type",
        "missing_cost_basis_basic",
        "missing_fiat_value",
      ]),
    );
  });
});
