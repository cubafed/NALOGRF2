# RU Tax Methodology V1 — deterministic engine (FIFO + RUB + NDFL rate)

Status: implemented (Phase 1). Supersedes the manual single-transaction estimate (V0) for
the engine path. Output is **preliminary, for review with an accountant** — never an
official filing or official amount due.

## Pipeline

```
Transaction[]
  → build acquisition lots        (src/lib/tax/lots/build-lots.ts)
  → match disposals by method     (src/lib/tax/methods/fifo.ts)
  → convert each leg to RUB by date (src/lib/tax/rates/convert.ts)
  → apply RU progressive rate      (src/lib/tax/jurisdictions/ru/index.ts)
  → preliminary tax base + amount  (src/lib/tax/engine/calculate-tax.ts)
```

## Definitions

- **Acquisition lots**: built from `buy`, `income`, `deposit` with a positive amount.
  Cost per unit (report currency) = manual cost-basis override → else `fiatValue`,
  converted on the transaction date. Unknown cost ⇒ `unitCostReport = null`.
- **Disposals**: `sell`, `p2p`. Proceeds = `fiatValue` converted on the disposal date.
  Fee = `feeAmount` converted when `feeAsset` is the report currency or a fiat with a
  known rate; a crypto-denominated fee needs a price (Phase 2) and is treated as 0 in V1.
- **Cost-basis method**: FIFO (earliest lots consumed first). Interface in
  `engine-types.ts` is ready for LIFO/HIFO/ACB/weighted-average later.
- **Currency conversion**: daily rate lookup keyed by `currency|YYYY-MM-DD`. Report
  currency converts 1:1. Missing rate ⇒ the affected operation is `needs_review`.
- **Taxable base**: net of included disposal gains/losses (report currency). A base ≤ 0
  yields zero tax (losses do not create a liability here).
- **RU rate (assumption, must be confirmed per year)**: progressive 13% up to
  5,000,000 ₽ of base, 15% above. Thresholds/rates are data-driven in `RU_TAX_BRACKETS`.

## needs_review (never a guessed number)

- proceeds missing or unconvertible (no rate) → `missing_fiat_proceeds`;
- disposal exceeds available lots → `uncovered_disposal_no_acquisition`;
- a consumed lot has unknown cost → `unknown_cost_basis`.

## Unsupported in V1 (future, each with methodology + tests)

- DeFi / liquidity / lending / margin / futures; NFT; staking/mining specifics beyond
  generic `income` FMV; crypto-denominated fee valuation; non-resident 30% rate;
  cost-basis methods other than FIFO; jurisdictions other than RU.

## Disclaimers (mandatory wherever the engine result is shown)

- «Предварительный расчёт. Не является налоговой, юридической или финансовой
  консультацией. Используйте для проверки с бухгалтером или налоговым консультантом.»
- «Это не налоговая декларация. Ставки и пороги — допущение, требующее подтверждения
  для соответствующего года.»
