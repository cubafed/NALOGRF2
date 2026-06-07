import { describe, it, expect } from "vitest";
import { okxAdapter } from "@/lib/integrations/adapters/okx";
import { kucoinAdapter } from "@/lib/integrations/adapters/kucoin";
import { krakenAdapter } from "@/lib/integrations/adapters/kraken";
import { getAdapterById, detectAdapter, exchangeAdapters } from "@/lib/integrations/registry";

describe("OKX adapter", () => {
  it("is registered", () => {
    expect(getAdapterById("okx")).toBe(okxAdapter);
  });

  it("auto-detects by signature headers", () => {
    const headers = ["Order Time", "Instrument Name", "Trade ID", "Side", "Fill Quantity", "Fill Price"];
    expect(detectAdapter(headers)?.id).toBe("okx");
  });

  it("maps a buy row correctly", () => {
    const values: Record<string, string> = {
      "Order Time": "2024-03-15 10:00:00",
      "Instrument Name": "BTC-USDT",
      "Trade ID": "t1",
      Side: "buy",
      "Fill Quantity": "0.5",
      "Fill Price": "65000",
      Fee: "0.0005",
      "Fee Currency": "BTC",
    };
    const rows = okxAdapter.mapRow(values);
    expect(rows).toHaveLength(1);
    expect(rows[0].asset).toBe("BTC");
    expect(rows[0].type).toBe("buy");
    expect(rows[0].amount).toBe("0.5");
  });
});

describe("KuCoin adapter", () => {
  it("is registered", () => {
    expect(getAdapterById("kucoin")).toBe(kucoinAdapter);
  });

  it("auto-detects by signature headers", () => {
    const headers = ["tradeCreatedAt", "orderId", "symbol", "side", "price", "size", "funds"];
    expect(detectAdapter(headers)?.id).toBe("kucoin");
  });

  it("maps a sell row and extracts base asset from symbol", () => {
    const values: Record<string, string> = {
      tradeCreatedAt: "2024-04-01T12:00:00Z",
      orderId: "order1",
      symbol: "ETH-USDT",
      side: "sell",
      price: "3500",
      size: "1.5",
      funds: "5250",
      fee: "5.25",
      feeCurrency: "USDT",
    };
    const rows = kucoinAdapter.mapRow(values);
    expect(rows).toHaveLength(1);
    expect(rows[0].asset).toBe("ETH");
    expect(rows[0].type).toBe("sell");
    expect(rows[0].amount).toBe("1.5");
  });
});

describe("Kraken adapter", () => {
  it("is registered", () => {
    expect(getAdapterById("kraken")).toBe(krakenAdapter);
  });

  it("auto-detects by signature headers", () => {
    const headers = ["txid", "refid", "time", "type", "aclass", "asset", "amount", "fee", "balance"];
    expect(detectAdapter(headers)?.id).toBe("kraken");
  });

  it("maps a deposit row and normalises XXBT → BTC", () => {
    const values: Record<string, string> = {
      txid: "tx1",
      refid: "ref1",
      time: "2024-05-10 08:30:00",
      type: "deposit",
      aclass: "currency",
      asset: "XXBT",
      amount: "0.25",
      fee: "0",
      balance: "0.25",
    };
    const rows = krakenAdapter.mapRow(values);
    expect(rows).toHaveLength(1);
    expect(rows[0].asset).toBe("BTC");
    expect(rows[0].type).toBe("deposit");
  });

  it("maps 'spend' type to sell", () => {
    const values: Record<string, string> = {
      txid: "tx2",
      refid: "ref2",
      time: "2024-05-11 10:00:00",
      type: "spend",
      aclass: "currency",
      asset: "XETH",
      amount: "1",
      fee: "0.001",
      balance: "2",
    };
    const rows = krakenAdapter.mapRow(values);
    expect(rows[0].type).toBe("sell");
    expect(rows[0].asset).toBe("ETH");
  });
});

describe("registry", () => {
  it("has 5 adapters total", () => {
    expect(exchangeAdapters.length).toBe(5);
  });
});
