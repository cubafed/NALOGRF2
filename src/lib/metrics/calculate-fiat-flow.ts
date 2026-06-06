import type { Transaction } from "@/lib/domain/types";
import type { FiatFlowResult, FiatFlowByCurrency, MonthlyFiatBucket } from "./analytics-types";

const INFLOW_TYPES = new Set(["sell", "deposit", "p2p", "income"]);
const OUTFLOW_TYPES = new Set(["buy", "withdrawal", "fee"]);

function parseMonth(tx: Transaction): string {
  const raw = tx.date ?? tx.timestamp ?? "";
  if (!raw) return "unknown-date";
  const m = String(raw).match(/^(\d{4}-\d{2})/);
  return m ? m[1] : "unknown-date";
}

export function calculateFiatFlow(transactions: Transaction[]): FiatFlowResult {
  let missingFiatValueCount = 0;
  let unclassifiedTypeCount = 0;

  const currencyMap = new Map<string, Map<string, MonthlyFiatBucket>>();

  for (const tx of transactions) {
    const rawFiat = tx.fiatValue;
    if (rawFiat === null || rawFiat === undefined || rawFiat === "") {
      missingFiatValueCount++;
      continue;
    }
    const fiatNum = Number(rawFiat);
    if (!isFinite(fiatNum) || isNaN(fiatNum)) {
      missingFiatValueCount++;
      continue;
    }

    const isInflow = INFLOW_TYPES.has(tx.type);
    const isOutflow = OUTFLOW_TYPES.has(tx.type);

    if (!isInflow && !isOutflow) {
      unclassifiedTypeCount++;
      continue;
    }

    const currency = tx.fiatCurrency ?? "UNKNOWN";
    const month = parseMonth(tx);

    if (!currencyMap.has(currency)) {
      currencyMap.set(currency, new Map());
    }
    const monthMap = currencyMap.get(currency)!;

    if (!monthMap.has(month)) {
      monthMap.set(month, { month, inflow: 0, outflow: 0, net: 0 });
    }
    const bucket = monthMap.get(month)!;

    if (isInflow) {
      bucket.inflow += fiatNum;
    } else {
      bucket.outflow += fiatNum;
    }
    bucket.net = bucket.inflow - bucket.outflow;
  }

  // Compute per-currency totals and sort months chronologically
  const byCurrency: FiatFlowByCurrency[] = [];
  for (const [currency, monthMap] of currencyMap) {
    const months = Array.from(monthMap.values()).sort((a, b) => {
      if (a.month === "unknown-date") return 1;
      if (b.month === "unknown-date") return -1;
      return a.month.localeCompare(b.month);
    });
    const totalInflow = months.reduce((s, m) => s + m.inflow, 0);
    const totalOutflow = months.reduce((s, m) => s + m.outflow, 0);
    byCurrency.push({ currency, months, totalInflow, totalOutflow, netFlow: totalInflow - totalOutflow });
  }

  // Sort currencies by total transaction volume desc
  byCurrency.sort((a, b) => (b.totalInflow + b.totalOutflow) - (a.totalInflow + a.totalOutflow));

  return { byCurrency, missingFiatValueCount, unclassifiedTypeCount };
}
