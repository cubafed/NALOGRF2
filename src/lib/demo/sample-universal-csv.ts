export const sampleUniversalCsv = `date,type,asset,amount,price,fiat_value,fiat_currency,fee,fee_asset,tx_hash,order_id,counterparty,source,notes
2024-03-14,buy,BTC,0.10,65000,6500,USD,0.0001,BTC,btc-hash-001,order-001,Binance Spot,Binance,Valid buy with fee
2024-04-02,sell,ETH,2,3500,7000,USD,12.50,USD,eth-hash-002,order-002,Bank account,Bybit,Valid sell with fiat value
2024-04-18,deposit,USDT,12000,,12000,USD,,,usdt-hash-003,,External wallet,Manual,Deposit from external wallet
2024-05-10,rebate,USDT,50,not-a-number,50,USD,,,,order-004,Exchange rebate,Exchange,Unknown type and optional number should warn
2024-05-18,p2p,USDT,8000,,8000,USD,,,,order-005,P2P counterparty,Binance P2P,Large P2P inflow
2024-05-24,sell,DOGE,2500,0.18,450,USD,,,,order-006,Bank account,Exchange,No earlier DOGE acquisition should trigger missing cost basis
2024-05-28,transfer,SOL,12,,,,,,,,Cold wallet,Wallet,Missing fiat value should be reviewed
2024-06-01,withdrawal,,1.5,3200,4800,USD,,,,order-007,Cold wallet,Manual,Missing asset should error`;
