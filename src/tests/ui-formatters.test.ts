import { describe, expect, it } from "vitest";
import { formatCount, formatDateShort, formatPercent } from "@/lib/ui/formatters";

describe("ui formatters", () => {
  it("formats counts for Russian locale", () => {
    expect(formatCount(1840)).toBe("1 840");
  });

  it("falls back for invalid counts", () => {
    expect(formatCount(Number.NaN)).toBe("0");
  });

  it("formats percent values", () => {
    expect(formatPercent(64.4)).toBe("64%");
    expect(formatPercent(64.46, { maximumFractionDigits: 1 })).toBe("64,5%");
  });

  it("formats short dates safely", () => {
    expect(formatDateShort("2024-05-03T12:00:00.000Z")).toBe("03.05.2024");
    expect(formatDateShort("not-a-date")).toBe("Нет данных");
    expect(formatDateShort(null)).toBe("Нет данных");
  });
});
