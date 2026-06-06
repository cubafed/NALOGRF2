import { describe, expect, it } from "vitest";
import { buildAnalyticsDashboard } from "@/lib/metrics/build-analytics-dashboard";
import { makeAnalyticsSession } from "./analytics-test-fixtures";

describe("buildAnalyticsDashboard", () => {
  it("returns summary metrics from a valid local import session", () => {
    const dashboard = buildAnalyticsDashboard(makeAnalyticsSession());

    expect(dashboard.summary).toMatchObject({
      totalOperations: 5,
      parsedTransactions: 4,
      parserErrors: 1,
      parserWarnings: 2,
      readinessScore: 58,
      totalFindings: 3,
      criticalFindings: 1,
      mediumFindings: 1,
      lowFindings: 1,
      uniqueAssets: 4,
      uniqueSources: 2,
    });
  });

  it("changes report readiness recommendation based on critical/medium/low findings", () => {
    const critical = buildAnalyticsDashboard(makeAnalyticsSession());
    expect(critical.reportReadiness.recommendedNextAction).toBe(
      "Сначала разберите критичные проблемы",
    );

    const mediumSession = makeAnalyticsSession();
    mediumSession.riskResult.summary.criticalCount = 0;
    const medium = buildAnalyticsDashboard(mediumSession);
    expect(medium.reportReadiness.recommendedNextAction).toBe("Проверьте средние проблемы");

    const lowSession = makeAnalyticsSession();
    lowSession.riskResult.summary.criticalCount = 0;
    lowSession.riskResult.summary.mediumCount = 0;
    const low = buildAnalyticsDashboard(lowSession);
    expect(low.reportReadiness.recommendedNextAction).toBe(
      "Отчет выглядит готовым для первичной проверки",
    );
  });
});
