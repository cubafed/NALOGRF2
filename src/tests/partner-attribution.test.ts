import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearPartnerAttribution,
  loadPartnerAttribution,
  savePartnerAttribution,
} from "@/lib/client/partner-attribution-storage";
import { parsePartnerAttribution } from "@/lib/partners/parse-partner-attribution";
import type { PartnerAttribution } from "@/lib/partners/partner-types";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const attribution: PartnerAttribution = {
  partner: "demo-exchange",
  ref: null,
  utmSource: "exchange-page",
  utmMedium: null,
  utmCampaign: "mvp-demo",
  utmContent: null,
  utmTerm: null,
  capturedAt: "2026-06-05T00:00:00.000Z",
  landingPath: "/upload",
};

function stubWindowWithStorage(storage: Storage): void {
  vi.stubGlobal("window", { localStorage: storage });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parsePartnerAttribution", () => {
  it("returns null when no params exist", () => {
    expect(parsePartnerAttribution(new URLSearchParams("q=test"), "/upload")).toBeNull();
  });

  it("parses partner and utm values", () => {
    const result = parsePartnerAttribution(
      new URLSearchParams(
        "partner=demo-exchange&utm_source=telegram&utm_medium=social&utm_campaign=tax-season&utm_content=post-1&utm_term=crypto&ref=abc",
      ),
      "/upload",
      "2026-06-05T00:00:00.000Z",
    );

    expect(result).toEqual({
      partner: "demo-exchange",
      ref: "abc",
      utmSource: "telegram",
      utmMedium: "social",
      utmCampaign: "tax-season",
      utmContent: "post-1",
      utmTerm: "crypto",
      capturedAt: "2026-06-05T00:00:00.000Z",
      landingPath: "/upload",
    });
  });

  it("trims values and converts empty values to null", () => {
    const result = parsePartnerAttribution(
      new URLSearchParams("partner=%20demo-accountant%20&utm_source=%20&utm_campaign=mvp-demo"),
      "/",
      "2026-06-05T00:00:00.000Z",
    );

    expect(result?.partner).toBe("demo-accountant");
    expect(result?.utmSource).toBeNull();
    expect(result?.utmCampaign).toBe("mvp-demo");
  });
});

describe("partner attribution storage", () => {
  it("saves and loads partner attribution with valid data", () => {
    stubWindowWithStorage(new MemoryStorage());

    savePartnerAttribution(attribution);

    expect(loadPartnerAttribution()).toEqual(attribution);
  });

  it("returns null when no data exists", () => {
    stubWindowWithStorage(new MemoryStorage());

    expect(loadPartnerAttribution()).toBeNull();
  });

  it("handles invalid JSON safely", () => {
    const storage = new MemoryStorage();
    storage.setItem("crypto-audit-report.partner-attribution.v1", "{bad json");
    stubWindowWithStorage(storage);

    expect(loadPartnerAttribution()).toBeNull();
  });

  it("removes stored data", () => {
    stubWindowWithStorage(new MemoryStorage());
    savePartnerAttribution(attribution);

    clearPartnerAttribution();

    expect(loadPartnerAttribution()).toBeNull();
  });

  it("does not crash when storage is unavailable", () => {
    const blockedWindow: Record<string, unknown> = {};
    Object.defineProperty(blockedWindow, "localStorage", {
      get: () => {
        throw new Error("storage unavailable");
      },
    });
    vi.stubGlobal("window", blockedWindow);

    expect(() => savePartnerAttribution(attribution)).not.toThrow();
    expect(loadPartnerAttribution()).toBeNull();
    expect(() => clearPartnerAttribution()).not.toThrow();
  });
});
