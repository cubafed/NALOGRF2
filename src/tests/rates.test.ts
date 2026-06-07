import { describe, it, expect } from "vitest";
import { parseCbrXml } from "@/lib/rates/cbr-xml-parser";
import { COINGECKO_ID } from "@/lib/rates/prices-client";

const SAMPLE_CBR_XML = `<?xml version="1.0" encoding="windows-1251"?>
<ValCurs Date="06.06.2026" name="Foreign Currency Market">
  <Valute ID="R01235">
    <NumCode>840</NumCode>
    <CharCode>USD</CharCode>
    <Nominal>1</Nominal>
    <Name>US Dollar</Name>
    <Value>90,2500</Value>
    <VunitRate>90,2500</VunitRate>
  </Valute>
  <Valute ID="R01239">
    <NumCode>978</NumCode>
    <CharCode>EUR</CharCode>
    <Nominal>1</Nominal>
    <Name>Euro</Name>
    <Value>96,1500</Value>
    <VunitRate>96,1500</VunitRate>
  </Valute>
  <Valute ID="R01523">
    <NumCode>398</NumCode>
    <CharCode>KZT</CharCode>
    <Nominal>100</Nominal>
    <Name>Kazakhstani Tenge</Name>
    <Value>18,5000</Value>
    <VunitRate>0,1850</VunitRate>
  </Valute>
</ValCurs>`;

describe("parseCbrXml", () => {
  it("parses USD and EUR with Nominal=1 correctly", () => {
    const entries = parseCbrXml(SAMPLE_CBR_XML, "2026-06-06");
    const usd = entries.find((e) => e.currency === "USD");
    const eur = entries.find((e) => e.currency === "EUR");
    expect(usd?.rateToReport).toBeCloseTo(90.25, 4);
    expect(eur?.rateToReport).toBeCloseTo(96.15, 4);
  });

  it("divides Value by Nominal for currencies like KZT (Nominal=100)", () => {
    const entries = parseCbrXml(SAMPLE_CBR_XML, "2026-06-06");
    const kzt = entries.find((e) => e.currency === "KZT");
    expect(kzt?.rateToReport).toBeCloseTo(0.185, 4);
  });

  it("attaches the supplied date to every entry", () => {
    const entries = parseCbrXml(SAMPLE_CBR_XML, "2026-06-06");
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.date === "2026-06-06")).toBe(true);
  });

  it("returns empty array for empty or malformed XML", () => {
    expect(parseCbrXml("", "2026-06-06")).toEqual([]);
    expect(parseCbrXml("<notvalid>", "2026-06-06")).toEqual([]);
  });

  it("skips entries with invalid Nominal or Value", () => {
    const badXml = `<ValCurs>
      <Valute ID="X1">
        <CharCode>FOO</CharCode>
        <Nominal>0</Nominal>
        <Value>90,0000</Value>
      </Valute>
      <Valute ID="X2">
        <CharCode>BAR</CharCode>
        <Nominal>1</Nominal>
        <Value>abc</Value>
      </Valute>
    </ValCurs>`;
    expect(parseCbrXml(badXml, "2026-06-06")).toEqual([]);
  });
});

describe("COINGECKO_ID", () => {
  it("maps major tickers to CoinGecko IDs", () => {
    expect(COINGECKO_ID["BTC"]).toBe("bitcoin");
    expect(COINGECKO_ID["ETH"]).toBe("ethereum");
    expect(COINGECKO_ID["USDT"]).toBe("tether");
    expect(COINGECKO_ID["SOL"]).toBe("solana");
  });

  it("contains at least 10 known assets", () => {
    expect(Object.keys(COINGECKO_ID).length).toBeGreaterThanOrEqual(10);
  });
});
