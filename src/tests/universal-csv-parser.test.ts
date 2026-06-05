import { describe, expect, it } from "vitest";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";

const header =
  "date,type,asset,amount,price,fiat_value,fiat_currency,fee,fee_asset,tx_hash,order_id,counterparty,source,notes";

describe("parseUniversalCsv", () => {
  it("parses valid CSV successfully", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,BTC,0.1,65000,6500,USD,0.0001,BTC,hash-1,order-1,exchange,Binance,first buy`);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      id: "universal-row-2",
      timestamp: "2024-03-14",
      type: "buy",
      asset: "BTC",
      amount: "0.1",
      price: "65000",
      fiatValue: "6500",
      fiatCurrency: "USD",
      rawRowNumber: 2,
    });
  });

  it("parses a valid row with fees", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14T12:30:00Z,sell,ETH,2,3500,7000,USD,12.5,USD,hash-2,order-2,bank,Bybit,fee included`);

    expect(result.errors).toEqual([]);
    expect(result.transactions[0]?.feeAmount).toBe("12.5");
    expect(result.transactions[0]?.feeAsset).toBe("USD");
    expect(result.transactions[0]?.timestamp).toBe("2024-03-14T12:30:00Z");
  });

  it("returns an error for a missing required field", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,,0.1,65000,6500,USD,,,,,,Binance,missing asset`);

    expect(result.transactions).toHaveLength(0);
    expect(result.rawRows[0]?.status).toBe("error");
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "MISSING_REQUIRED_FIELD",
        rowNumber: 2,
        field: "asset",
        severity: "error",
      }),
    );
  });

  it("returns an error for a missing required header", () => {
    const result = parseUniversalCsv("date,type,amount\n2024-03-14,buy,0.1");

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "MISSING_REQUIRED_HEADER",
        field: "asset",
        severity: "error",
      }),
    );
  });

  it("returns an error for an invalid date", () => {
    const result = parseUniversalCsv(`${header}
14/03/2024,buy,BTC,0.1,65000,6500,USD,,,,,,Binance,bad date`);

    expect(result.transactions).toHaveLength(0);
    expect(result.rawRows[0]?.status).toBe("error");
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "INVALID_DATE",
        rowNumber: 2,
        field: "date",
        value: "14/03/2024",
      }),
    );
  });

  it("returns an error for an invalid required numeric value", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,BTC,not-a-number,65000,6500,USD,,,,,,Binance,bad amount`);

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "INVALID_NUMBER",
        rowNumber: 2,
        field: "amount",
        value: "not-a-number",
      }),
    );
  });

  it("returns a warning for an invalid optional numeric value", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,BTC,0.1,not-a-number,6500,USD,,,,,,Binance,bad optional`);

    expect(result.errors).toEqual([]);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]?.price).toBeUndefined();
    expect(result.rawRows[0]?.status).toBe("warning");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "INVALID_OPTIONAL_NUMBER",
        rowNumber: 2,
        field: "price",
        value: "not-a-number",
      }),
    );
  });

  it("classifies unknown transaction types with a warning", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,rebate,USDT,10,,10,USD,,,,,,Exchange,unknown type`);

    expect(result.errors).toEqual([]);
    expect(result.transactions[0]?.type).toBe("unknown");
    expect(result.transactions[0]?.originalType).toBe("rebate");
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "UNKNOWN_TRANSACTION_TYPE",
        rowNumber: 2,
        field: "type",
        value: "rebate",
      }),
    );
  });

  it("returns an error for empty CSV", () => {
    const result = parseUniversalCsv("  \n ");

    expect(result.transactions).toEqual([]);
    expect(result.rawRows).toEqual([]);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "EMPTY_CSV",
        severity: "error",
      }),
    );
  });

  it("preserves raw rows including rows that cannot become transactions", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,BTC,0.1,65000,6500,USD,,,,,, Binance ," spaced note "
bad-date,sell,ETH,2,3500,7000,USD,,,,,,Bybit,bad date`);

    expect(result.rawRows).toHaveLength(2);
    expect(result.rawRows[0]?.rowNumber).toBe(2);
    expect(result.rawRows[0]?.raw.source).toBe(" Binance ");
    expect(result.rawRows[0]?.normalized.source).toBe("Binance");
    expect(result.rawRows[1]?.status).toBe("error");
    expect(result.transactions).toHaveLength(1);
  });

  it("reports summary counts correctly", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,buy,BTC,0.1,65000,6500,USD,,,,,,Binance,ok
2024-03-15,rebate,USDT,10,,10,USD,,,,,,Exchange,warning
bad-date,sell,ETH,2,3500,7000,USD,,,,,,Bybit,error`);

    expect(result.summary).toEqual({
      totalRows: 3,
      parsedRows: 2,
      warningRows: 1,
      errorRows: 1,
      transactionCount: 2,
      warningCount: 1,
      errorCount: 1,
    });
  });

  it("supports quoted comma-separated values", () => {
    const result = parseUniversalCsv(`${header}
2024-03-14,deposit,USDT,100,,100,USD,,,,,"Counterparty, Ltd",Exchange,"note, with comma"`);

    expect(result.errors).toEqual([]);
    expect(result.transactions[0]?.counterparty).toBe("Counterparty, Ltd");
    expect(result.transactions[0]?.notes).toBe("note, with comma");
  });
});
