import type { Transaction } from "@/lib/domain/types";
import { classifyTaxEvent } from "@/lib/tax/classify-tax-event";
import type { TaxEventClassification } from "@/lib/tax/tax-event-types";

export function classifyTaxEvents(transactions: readonly Transaction[]): TaxEventClassification[] {
  if (!Array.isArray(transactions)) {
    throw new TypeError("classifyTaxEvents expects an array of transactions.");
  }

  return transactions.map((transaction) => classifyTaxEvent(transaction));
}
