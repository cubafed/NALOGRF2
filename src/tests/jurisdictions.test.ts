import { describe, it, expect } from "vitest";
import {
  jurisdictions,
  getJurisdiction,
  getJurisdictionInfo,
  DEFAULT_JURISDICTION_CODE,
  ruResidentJurisdiction,
  ruNonResidentJurisdiction,
} from "@/lib/tax/jurisdictions";

describe("jurisdiction registry", () => {
  it("exposes available RU profiles and planned country stubs", () => {
    const available = jurisdictions.filter((j) => j.status === "available").map((j) => j.code);
    const planned = jurisdictions.filter((j) => j.status === "planned").map((j) => j.code);
    expect(available).toEqual(expect.arrayContaining(["ru_resident", "ru_nonresident"]));
    expect(planned.length).toBeGreaterThanOrEqual(1);
  });

  it("getJurisdiction resolves available modules and returns null for planned/unknown", () => {
    expect(getJurisdiction("ru_resident")).toBe(ruResidentJurisdiction);
    expect(getJurisdiction("ru_nonresident")).toBe(ruNonResidentJurisdiction);
    // Planned jurisdictions never produce tax numbers.
    expect(getJurisdiction("us")).toBeNull();
    expect(getJurisdiction("does-not-exist")).toBeNull();
  });

  it("getJurisdictionInfo returns metadata including a rate summary", () => {
    const info = getJurisdictionInfo("ru_resident");
    expect(info?.label).toContain("резидент");
    expect(info?.reportCurrency).toBe("RUB");
    expect(info?.rateSummary).toContain("13%");
  });

  it("default jurisdiction is RU resident", () => {
    expect(DEFAULT_JURISDICTION_CODE).toBe("ru_resident");
    expect(getJurisdictionInfo(DEFAULT_JURISDICTION_CODE)?.status).toBe("available");
  });
});

describe("RU resident vs non-resident computeTax", () => {
  it("resident applies 13% then 15% above 5M RUB", () => {
    // 1,000,000 → 13%
    expect(ruResidentJurisdiction.computeTax(1_000_000).taxAmountReport).toBeCloseTo(130_000, 6);
    // 6,000,000 → 5M @13% + 1M @15% = 650,000 + 150,000
    expect(ruResidentJurisdiction.computeTax(6_000_000).taxAmountReport).toBeCloseTo(800_000, 6);
  });

  it("non-resident applies a flat 30%", () => {
    expect(ruNonResidentJurisdiction.computeTax(1_000_000).taxAmountReport).toBeCloseTo(300_000, 6);
    expect(ruNonResidentJurisdiction.computeTax(6_000_000).taxAmountReport).toBeCloseTo(1_800_000, 6);
    const applied = ruNonResidentJurisdiction.computeTax(6_000_000).appliedBrackets;
    expect(applied).toHaveLength(1);
    expect(applied[0].rate).toBe(0.3);
  });

  it("both yield zero tax on a non-positive base", () => {
    expect(ruResidentJurisdiction.computeTax(0).taxAmountReport).toBe(0);
    expect(ruNonResidentJurisdiction.computeTax(-100).taxAmountReport).toBe(0);
  });
});
