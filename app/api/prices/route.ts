// In-memory cache keyed by "coinId|YYYY-MM-DD|currency". Prevents repeated CoinGecko requests.
// null means the price was requested but is unavailable for that coin/date/currency.
const priceCache = new Map<string, number | null>();

/**
 * GET /api/prices?coin=bitcoin&date=YYYY-MM-DD&currency=usd
 *
 * Fetches a historical crypto price from CoinGecko for the given coin, date, and fiat currency.
 * The price is cached in memory by (coin, date, currency) for reproducibility.
 *
 * Use the CoinGecko coin ID (e.g. "bitcoin", "ethereum", "tether"), not the ticker symbol.
 * The `currency` parameter defaults to "usd".
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin");
  const date = searchParams.get("date");
  const currency = (searchParams.get("currency") ?? "usd").toLowerCase();

  if (!coin || !coin.trim()) {
    return Response.json({ error: "Missing coin parameter (e.g. bitcoin, ethereum)." }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "Missing or invalid date. Use YYYY-MM-DD (e.g. 2024-03-15)." },
      { status: 400 },
    );
  }

  const cacheKey = `${coin}|${date}|${currency}`;
  if (priceCache.has(cacheKey)) {
    const price = priceCache.get(cacheKey);
    if (price === null) {
      return Response.json(
        { error: "Price not available for this coin/date/currency." },
        { status: 404 },
      );
    }
    return Response.json({ date, coin, currency, price });
  }

  // CoinGecko requires DD-MM-YYYY
  const [year, month, day] = date.split("-");
  const cgDate = `${day}-${month}-${year}`;

  let price: number | null = null;
  try {
    const url =
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coin)}/history` +
      `?date=${cgDate}&localization=false`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      priceCache.set(cacheKey, null);
      return Response.json(
        { error: `CoinGecko responded with status ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    const raw = data?.market_data?.current_price?.[currency];
    price = typeof raw === "number" ? raw : null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Failed to reach CoinGecko: ${message}` }, { status: 502 });
  }

  priceCache.set(cacheKey, price);

  if (price === null) {
    return Response.json(
      { error: "Price not available for this coin/date/currency." },
      { status: 404 },
    );
  }
  return Response.json({ date, coin, currency, price });
}
