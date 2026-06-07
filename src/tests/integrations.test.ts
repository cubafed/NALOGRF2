import { describe, it, expect } from "vitest";
import { parseCsvToObjects, tokenizeCsv } from "@/lib/parsers/csv-tokenizer";
import {
  detectAdapter,
  getAdapterById,
  importExchangeCsv,
} from "@/lib/integrations";

describe("csv-tokenizer", () => {
  it("tokenizes quoted cells with embedded commas and escaped quotes", () => {
    const records = tokenizeCsv('a,b\n"x,y","he said ""hi"""');
    expect(records[1].cells).toEqual(["x,y", 'he said "hi"']);
  });

  it("parseCsvToObjects maps headers to trimmed values and skips blank rows", () => {
    const { headers, rows } = parseCsvToObjects("Coin, Change\nBTC, 1\n\nETH, 2\n");
    expect(headers).toEqual(["Coin", "Change"]);
    expect(rows).toHaveLength(2);
    expect(rows[0].values).toEqual({ Coin: "BTC", Change: "1" });
  });
});

describe("detectAdapter", () => {
  it("detects Binance by signature headers (case-insensitive)", () => {
    const adapter = detectAdapter(["utc_time", "operation", "coin", "change", "remark"]);
    expect(adapter?.id).toBe("binance");
  });

  it("detects Bybit by signature headers", () => {
    const adapter = detectAdapter(["Time", "Currency", "Type", "Quantity", "Fee"]);
    expect(adapter?.id).toBe("bybit");
  });

  it("returns null for unknown headers", () => {
    expect(detectAdapter(["foo", "bar"])).toBeNull();
  });

  it("looks up adapters by id", () => {
    expect(getAdapterById("binance")?.label).toBe("Binance");
    expect(getAdapterById("nope")).toBeNull();
  });
});

describe("importExchangeCsv — Binance", () => {
  const csv = [
    "UTC_Time,Account,Operation,Coin,Change,Remark",
    "2024-03-14 12:30:00,Spot,Deposit,USDT,1000,",
    "2024-03-15 09:00:00,Spot,Buy,BTC,0.5,",
    "2024-03-16 10:00:00,Spot,Withdraw,USDT,-200,bank",
  ].join("\n");

  it("normalizes Binance rows into canonical transactions", () => {
    const result = importExchangeCsv(csv);
    expect(result.adapterId).toBe("binance");
    expect(result.transactions).toHaveLength(3);

    const deposit = result.transactions[0];
    expect(deposit.type).toBe("deposit");
    expect(deposit.asset).toBe("USDT");
    expect(deposit.amount).toBe("1000");
    expect(deposit.timestamp).toBe("2024-03-14T12:30:00Z");
    expect(deposit.source).toBe("Binance");

    const withdrawal = result.transactions[2];
    expect(withdrawal.type).toBe("withdrawal");
    expect(withdrawal.amount).toBe("200"); // sign stripped, magnitude kept
  });

  it("maps unknown operations to the unknown type instead of dropping them", () => {
    const weird = [
      "UTC_Time,Operation,Coin,Change",
      "2024-03-14 12:30:00,Mystery Op,BTC,1",
    ].join("\n");
    const result = importExchangeCsv(weird);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].type).toBe("unknown");
  });
});

describe("importExchangeCsv — Bybit", () => {
  const csv = [
    "Time,Currency,Type,Quantity,Fee,Fee Currency,Description",
    "2024-05-01 00:00:00,USDT,Deposit,5000,0,USDT,",
    "2024-05-02 00:00:00,BTC,Trade,0.1,0.0001,BTC,spot buy",
  ].join("\n");

  it("normalizes Bybit rows and captures fees", () => {
    const result = importExchangeCsv(csv);
    expect(result.adapterId).toBe("bybit");
    expect(result.transactions).toHaveLength(2);

    const trade = result.transactions[1];
    expect(trade.type).toBe("conversion");
    expect(trade.asset).toBe("BTC");
    expect(trade.feeAmount).toBe("0.0001");
    expect(trade.feeAsset).toBe("BTC");
  });
});

describe("importExchangeCsv — dedup and fallback", () => {
  it("removes exact-duplicate canonical rows", () => {
    const csv = [
      "UTC_Time,Operation,Coin,Change",
      "2024-03-14 12:30:00,Deposit,USDT,1000",
      "2024-03-14 12:30:00,Deposit,USDT,1000",
    ].join("\n");
    const result = importExchangeCsv(csv);
    expect(result.duplicatesRemoved).toBe(1);
    expect(result.transactions).toHaveLength(1);
  });

  it("falls back to universal parsing when no adapter matches", () => {
    const csv = ["date,type,asset,amount", "2024-03-14,buy,BTC,1"].join("\n");
    const result = importExchangeCsv(csv);
    expect(result.adapterId).toBeNull();
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].asset).toBe("BTC");
  });

  it("respects an explicitly forced adapter id", () => {
    const csv = ["UTC_Time,Operation,Coin,Change", "2024-03-14 12:30:00,Deposit,USDT,1000"].join(
      "\n",
    );
    const result = importExchangeCsv(csv, { adapterId: "binance" });
    expect(result.adapterId).toBe("binance");
  });
});
