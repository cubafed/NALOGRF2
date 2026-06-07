import type { RateTableEntry } from "@/lib/tax/rates/convert";

/**
 * Parse a CBR XML_daily response into RateTableEntry[].
 * The CBR XML uses comma as the decimal separator and a Nominal field
 * that indicates how many units of the foreign currency one Value covers.
 * rateToReport = Value / Nominal (rate for 1 unit of the foreign currency in RUB).
 */
export function parseCbrXml(xml: string, date: string): RateTableEntry[] {
  const entries: RateTableEntry[] = [];
  const valutes = xml.matchAll(/<Valute\b[^>]*>([\s\S]*?)<\/Valute>/g);
  for (const [, body] of valutes) {
    const charCode = body.match(/<CharCode>([^<]+)<\/CharCode>/)?.[1]?.trim();
    const nominalStr = body.match(/<Nominal>([^<]+)<\/Nominal>/)?.[1]?.trim();
    const valueStr = body
      .match(/<Value>([^<]+)<\/Value>/)?.[1]
      ?.trim()
      .replace(",", ".");
    if (!charCode || !nominalStr || !valueStr) continue;
    const nominal = Number(nominalStr);
    const value = Number(valueStr);
    if (!Number.isFinite(nominal) || nominal <= 0 || !Number.isFinite(value) || value <= 0)
      continue;
    entries.push({
      currency: charCode.toUpperCase(),
      date,
      rateToReport: value / nominal,
    });
  }
  return entries;
}
