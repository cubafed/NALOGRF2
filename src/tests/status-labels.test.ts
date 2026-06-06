import { describe, expect, it } from "vitest";
import { getReadinessStatus, getSeverityLabel, getStatusMeta } from "@/lib/ui/status-labels";

describe("status labels", () => {
  it("maps known product statuses", () => {
    expect(getStatusMeta("ready")).toEqual({ label: "Готово", tone: "success" });
    expect(getStatusMeta("not_configured")).toEqual({
      label: "Не настроено",
      tone: "warning",
    });
    expect(getStatusMeta("local")).toEqual({ label: "Локальный режим", tone: "info" });
  });

  it("falls back safely for unknown status", () => {
    expect(getStatusMeta("unexpected")).toEqual({ label: "Недоступно", tone: "neutral" });
    expect(getStatusMeta(undefined)).toEqual({ label: "Недоступно", tone: "neutral" });
  });

  it("maps severity labels", () => {
    expect(getSeverityLabel("critical")).toBe("Критичная");
    expect(getSeverityLabel("medium")).toBe("Средняя");
    expect(getSeverityLabel("low")).toBe("Низкая");
  });

  it("falls back safely for unknown severity", () => {
    expect(getSeverityLabel("unknown")).toBe("Недоступно");
  });

  it("maps readiness labels to product statuses", () => {
    expect(getReadinessStatus("good")).toBe("ready");
    expect(getReadinessStatus("needs_review")).toBe("needs_review");
    expect(getReadinessStatus("high_risk")).toBe("error");
  });
});
