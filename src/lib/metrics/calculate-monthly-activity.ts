import type { Transaction } from "@/lib/domain/types";
import type { MonthlyActivityResult, MonthlyActivityBucket } from "./analytics-types";

function toYearMonth(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = String(raw).match(/^(\d{4}-\d{2})/);
  return m ? m[1] : null;
}

function monthLabel(yearMonth: string): string {
  try {
    const [year, month] = yearMonth.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat("ru-RU", { month: "short", year: "numeric" }).format(d);
  } catch {
    return yearMonth;
  }
}

export function calculateMonthlyActivity(transactions: Transaction[]): MonthlyActivityResult {
  const countMap = new Map<string, number>();
  let invalidDateCount = 0;

  for (const tx of transactions) {
    const ym = toYearMonth(tx.date) ?? toYearMonth(tx.timestamp);
    if (!ym) {
      invalidDateCount++;
      countMap.set("invalid-date", (countMap.get("invalid-date") ?? 0) + 1);
    } else {
      countMap.set(ym, (countMap.get(ym) ?? 0) + 1);
    }
  }

  const buckets: MonthlyActivityBucket[] = [];
  for (const [month, count] of countMap) {
    buckets.push({
      month,
      count,
      label: month === "invalid-date" ? "Неверная дата" : monthLabel(month),
    });
  }

  buckets.sort((a, b) => {
    if (a.month === "invalid-date") return 1;
    if (b.month === "invalid-date") return -1;
    return a.month.localeCompare(b.month);
  });

  return { buckets, invalidDateCount };
}
