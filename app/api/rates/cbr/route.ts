import { parseCbrXml } from "@/lib/rates/cbr-xml-parser";

// In-memory cache keyed by "YYYY-MM-DD". Each entry is { currency → rateToRub }.
// Instance-local; clears on server restart. Prevents repeated CBR requests within a session.
const rateCache = new Map<string, Record<string, number>>();

/**
 * GET /api/rates/cbr?date=YYYY-MM-DD
 *
 * Fetches daily exchange rates from the Central Bank of Russia (cbr.ru) for the given date
 * and returns them as a JSON map of { currencyCode → rubles per 1 unit }.
 *
 * The result is cached in memory so the same date is never fetched twice per server instance,
 * ensuring reproducible tax-engine results once a rate has been obtained.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "Missing or invalid date. Use YYYY-MM-DD (e.g. 2024-03-15)." },
      { status: 400 },
    );
  }

  if (rateCache.has(date)) {
    return Response.json({ date, rates: rateCache.get(date) });
  }

  // CBR requires DD/MM/YYYY
  const [year, month, day] = date.split("-");
  const cbrDate = `${day}/${month}/${year}`;

  let xml: string;
  try {
    const res = await fetch(
      `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${cbrDate}`,
      // CBR XML is windows-1251 encoded; disable Next.js deduplication so we control caching.
      { cache: "no-store" },
    );
    if (!res.ok) {
      return Response.json(
        { error: `CBR responded with status ${res.status}` },
        { status: 502 },
      );
    }
    const buffer = await res.arrayBuffer();
    xml = new TextDecoder("windows-1251").decode(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Failed to reach CBR: ${message}` }, { status: 502 });
  }

  const entries = parseCbrXml(xml, date);
  const rates: Record<string, number> = {};
  for (const entry of entries) {
    rates[entry.currency] = entry.rateToReport;
  }

  rateCache.set(date, rates);
  return Response.json({ date, rates });
}
