/**
 * Map common crypto ticker symbols to CoinGecko coin IDs.
 * Extend as new assets are encountered in user data.
 */
export const COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  TRX: "tron",
  TON: "the-open-network",
  MATIC: "matic-network",
  POL: "matic-network",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  SHIB: "shiba-inu",
  LTC: "litecoin",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
};

/**
 * Fetch the historical price for a ticker on a given date via the app's Route Handler.
 * Returns null when the ticker is unknown, the price is unavailable, or the request fails.
 *
 * @param ticker - uppercase ticker symbol, e.g. "BTC", "ETH"
 * @param date   - YYYY-MM-DD
 * @param currency - fiat currency for the price, e.g. "usd", "rub" (default: "usd")
 */
export async function fetchCryptoPrice(
  ticker: string,
  date: string,
  currency = "usd",
): Promise<number | null> {
  const coinId = COINGECKO_ID[ticker.toUpperCase()];
  if (!coinId) return null;
  try {
    const url =
      `/api/prices` +
      `?coin=${encodeURIComponent(coinId)}` +
      `&date=${encodeURIComponent(date)}` +
      `&currency=${encodeURIComponent(currency.toLowerCase())}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: { price: number | null } = await res.json();
    return typeof data.price === "number" ? data.price : null;
  } catch {
    return null;
  }
}
