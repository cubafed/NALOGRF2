import { describe, expect, it } from "vitest";
import type { Transaction } from "@/lib/domain/types";
import { classifyTaxEvent } from "@/lib/tax/classify-tax-event";
import { classifyTaxEvents } from "@/lib/tax/classify-tax-events";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    type: "buy",
    asset: "BTC",
    amount: "1",
    rawRowNumber: 10,
    ...overrides,
  };
}

describe("classifyTaxEvent", () => {
  it("classifies sell with fiat value as taxable_candidate", () => {
    const result = classifyTaxEvent(tx({ type: "sell", fiatValue: "100000", fiatCurrency: "RUB" }));

    expect(result).toMatchObject({
      transactionId: "tx-1",
      rawRowId: "10",
      category: "taxable_candidate",
      reasonCode: "sell_with_fiat_value",
      includedInFirstEstimate: true,
    });
    expect(result.requiredData).toContain("acquisition cost / cost basis");
  });

  it("classifies sell without fiat value as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "sell", fiatValue: null }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("sell_missing_fiat_value");
    expect(result.includedInFirstEstimate).toBe(false);
  });

  it("classifies p2p operation as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "p2p", source: "exchange export" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("p2p_requires_review");
    expect(result.explanation).toContain("proceeds");
    expect(result.includedInFirstEstimate).toBe(false);
  });

  it("classifies source-indicated p2p as needs_review", () => {
    const result = classifyTaxEvent(
      tx({ type: "sell", source: "P2P desk", fiatValue: "100000", fiatCurrency: "RUB" }),
    );

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("p2p_requires_review");
  });

  it("classifies buy as non_taxable_candidate", () => {
    const result = classifyTaxEvent(tx({ type: "buy" }));

    expect(result.category).toBe("non_taxable_candidate");
    expect(result.reasonCode).toBe("buy_acquisition_candidate");
    expect(result.explanation).toContain("acquisition history");
    expect(result.includedInFirstEstimate).toBe(false);
  });

  it("classifies deposit as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "deposit" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("deposit_source_review");
  });

  it("classifies withdrawal as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "withdrawal" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("withdrawal_destination_review");
  });

  it("classifies transfer as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "transfer" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("transfer_self_transfer_review");
  });

  it("classifies conversion as unsupported", () => {
    const result = classifyTaxEvent(tx({ type: "conversion" }));

    expect(result.category).toBe("unsupported");
    expect(result.reasonCode).toBe("conversion_unsupported_v0");
    expect(result.explanation).toContain("unsupported in the first draft tax estimate");
  });

  it("classifies income as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "income", fiatValue: "5000" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("income_requires_review");
  });

  it("classifies fee as needs_review", () => {
    const result = classifyTaxEvent(tx({ type: "fee" }));

    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("fee_linkage_required");
  });

  it("classifies unknown as excluded_from_estimate", () => {
    const result = classifyTaxEvent(tx({ type: "unknown" }));

    expect(result.category).toBe("excluded_from_estimate");
    expect(result.reasonCode).toBe("unknown_type_excluded");
    expect(result.includedInFirstEstimate).toBe(false);
  });

  it("handles missing required data without throwing", () => {
    const transaction = {
      type: "sell",
      asset: "",
      amount: "",
    } as unknown as Transaction;

    expect(() => classifyTaxEvent(transaction)).not.toThrow();

    const result = classifyTaxEvent(transaction);
    expect(result.category).toBe("needs_review");
    expect(result.reasonCode).toBe("missing_required_data");
    expect(result.includedInFirstEstimate).toBe(false);
  });

  it("classifies unsupported runtime transaction type safely", () => {
    const result = classifyTaxEvent(tx({ type: "rebate" as Transaction["type"] }));

    expect(result.category).toBe("unsupported");
    expect(result.reasonCode).toBe("unsupported_transaction_type");
  });
});

describe("classifyTaxEvents", () => {
  it("returns exactly one classification per transaction", () => {
    const transactions = [
      tx({ id: "sell", type: "sell", fiatValue: "100" }),
      tx({ id: "buy", type: "buy" }),
      tx({ id: "unknown", type: "unknown" }),
    ];

    const results = classifyTaxEvents(transactions);

    expect(results).toHaveLength(transactions.length);
    expect(results.map((result) => result.transactionId)).toEqual(["sell", "buy", "unknown"]);
  });

  it("throws only when input is not an array", () => {
    expect(() => classifyTaxEvents({} as unknown as Transaction[])).toThrow(TypeError);
  });
});
