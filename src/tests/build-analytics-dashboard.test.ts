import { describe, expect, it } from "vitest";
import { buildAnalyticsDashboard } from "@/lib/analytics/build-analytics-dashboard";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("buildAnalyticsDashboard", () => {
  it("returns summary metrics from a valid import session", () => {
    const dashboard = buildAnalyticsDashboard(makeAnalyticsSession());

    expect(dashboard).toMatchObject({
      fileName: "sample.csv",
      period: "2024-01 — 2024-02",
      transactionCount: 4,
      sourceCount: 2,
      parserErrorCount: 1,
      parserWarningCount: 2,
      readinessScore: 58,
      readinessLabel: "needs_review",
      affectedTransactionCount: 3,
      importCompletenessPercent: 60,
      missingFiatValueCount: 1,
      unknownTransactionTypeCount: 1,
      sourceOfFundsGapCount: 3,
    });
    expect(dashboard.transactionsByType).toMatchObject({
      buy: 1,
      sell: 1,
      p2p: 1,
      unknown: 1,
    });
  });

  it("handles an empty session safely", () => {
    const session = makeAnalyticsSession();
    session.parserSummary = {
      totalRows: 0,
      parsedRows: 0,
      warningRows: 0,
      errorRows: 0,
      transactionCount: 0,
      warningCount: 0,
      errorCount: 0,
    };
    session.transactions = [];
    session.parserWarnings = [];
    session.parserErrors = [];
    session.rawRows = [];
    session.riskResult = {
      findings: [],
      summary: {
        totalFindings: 0,
        criticalCount: 0,
        mediumCount: 0,
        lowCount: 0,
        affectedTransactionCount: 0,
        rulesTriggered: [],
      },
      readinessScore: 100,
      readinessLabel: "good",
    };

    const dashboard = buildAnalyticsDashboard(session);

    expect(dashboard.period).toBe("Нет данных");
    expect(dashboard.transactionCount).toBe(0);
    expect(dashboard.sourceCount).toBe(0);
    expect(dashboard.importCompletenessPercent).toBe(0);
    expect(dashboard.monthlyTransactions).toEqual([]);
    expect(dashboard.findingsByRuleId).toEqual([]);
  });

  it("counts findings by severity and ruleId deterministically", () => {
    const dashboard = buildAnalyticsDashboard(makeAnalyticsSession());

    expect(dashboard.findingsBySeverity).toEqual({
      critical: 1,
      medium: 1,
      low: 1,
    });
    expect(dashboard.findingsByRuleId).toEqual([
      { label: "large_p2p_inflow", count: 1 },
      { label: "missing_cost_basis_basic", count: 1 },
      { label: "unknown_transaction_type", count: 1 },
    ]);
  });
});
