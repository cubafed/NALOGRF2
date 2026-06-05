import { describe, expect, it } from "vitest";
import { demoReport } from "@/lib/demo/demo-report";
import type { FindingSeverity } from "@/lib/domain/types";

const validSeverities: FindingSeverity[] = ["critical", "medium", "low"];

describe("demo report fixture", () => {
  it("has the required operations count", () => {
    expect(demoReport.operationsCount).toBe(184);
  });

  it("uses the required 2023-2024 period", () => {
    expect(demoReport.period.startYear).toBe(2023);
    expect(demoReport.period.endYear).toBe(2024);
    expect(demoReport.period.label).toBe("2023–2024");
  });

  it("has the required score", () => {
    expect(demoReport.readinessScore).toBe(64);
    expect(demoReport.riskScore).toBe(64);
  });

  it("has stable ruleId values", () => {
    expect(demoReport.findings.map((finding) => finding.ruleId)).toEqual([
      "missing_cost_basis",
      "large_p2p_inflow",
      "large_fiat_withdrawal",
      "unmatched_transfer",
      "unknown_source_wallet",
    ]);
  });

  it("uses only valid severities", () => {
    expect(demoReport.findings.every((finding) => validSeverities.includes(finding.severity))).toBe(
      true,
    );
  });

  it("matches the required demo metric counts", () => {
    expect(demoReport.metrics).toEqual({
      missingCostBasis: 17,
      p2pInflows: 6,
      largeFiatWithdrawals: 4,
      unmatchedTransfers: 3,
      unknownSourceWallets: 2,
    });
    expect(demoReport.findings.map((finding) => finding.count)).toEqual([17, 6, 4, 3, 2]);
  });
});
