# Platform Overview

Crypto tax + portfolio platform in the class of Koinly / BitNalog, RU-first, architected
for international markets. This document is the high-level map; `AGENTS.md` is the binding
source of truth for scope and boundaries.

## Three core abstractions

The engine is built so new jurisdictions, accounting methods, and import sources are
plugins rather than rewrites.

1. **Jurisdiction** — `src/lib/tax/jurisdictions/<code>/`
   Each module exports rates/brackets, taxable-base rules, report-form mapping
   (RU 3-НДФЛ first; later US Form 8949, etc.), the report currency, and locale.
   The engine core is jurisdiction-neutral; the module applies rate/rules/forms.

2. **Cost-basis method** — `src/lib/tax/methods/`
   A common interface matches disposals to acquisition lots. FIFO ships first;
   LIFO / HIFO / ACB / weighted-average implement the same interface later.

3. **Integrations** — `src/lib/integrations/`
   CSV adapters per exchange, read-only API connectors, and blockchain address/xpub sync,
   all normalizing into the canonical `Transaction` (`src/lib/domain/types.ts`).

## Engine data flow (deterministic)

```
Transaction[]  →  build lots (tax/lots)  →  match disposals (tax/methods)
              →  convert each leg to report currency by date (tax/rates)
              →  apply jurisdiction rules + rate (tax/jurisdictions)
              →  preliminary tax base + amount  (for review, never official)
```

External FX rates and prices are cached **by date** so a result is reproducible. Missing a
rate, price, or acquisition coverage produces `needs_review` — never a guessed number.

## Roadmap phases

| Phase | Scope |
|---|---|
| 0 | Governance — rewrite AGENTS.md (done) |
| 1 | Engine core: FIFO + RUB-by-ЦБ + NDFL rate, RU as first jurisdiction |
| 2 | Backend Route Handlers + external FX/price APIs (date-cached) |
| 3 | Import integrations (exchange CSV, API connectors, address sync) |
| 4 | Portfolio (holdings, valuation, realized/unrealized P&L) |
| 5 | AI advisor (explanations + declaration text drafts; no number generation) |
| 6 | Source-of-funds pack + RU bank-trigger review rules (115-ФЗ) |
| 7+ | International expansion (i18n, more jurisdictions, more methods, DeFi/NFT/staking coverage) |

## Non-negotiables

- Tax numbers come only from the deterministic engine; AI never produces them.
- Output is always preliminary, for review with an accountant — not an official filing.
- No automated filing, no tax payment, no AML scoring, no "bypass" framing.
- Nothing dropped silently; incomplete data → structured `needs_review`.
