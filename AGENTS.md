# Codex Working Rules

This repository is the standalone `Crypto Audit Report` app.

## Project State (read this first)

Single-page map of what already exists, so an agent does not reinvent or duplicate it.
Keep this section updated whenever a route, lib module, or major component is added.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Framer Motion (animations) · Recharts (charts) · Lucide React (icons) · Vitest (tests).

**Routes (`app/`):**

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/demo` | Static demo report |
| `/upload` | Browser-only universal CSV import + preview |
| `/dashboard` | Local analytics (fiat flow, completeness, activity, source coverage) |
| `/problems` | Deterministic review findings dashboard |
| `/report` | Report preview + bank-readiness document checklist + print/save-as-PDF |
| `/saved-reports` | Saved-report list (local service; Supabase variant gated/optional) |
| `/account` | Auth status (optional Supabase foundation) |
| `/partners` | Static partner pages + local attribution |
| `/api/rates/cbr` | Route Handler: CBR daily FX rates → JSON; in-memory date-keyed cache |
| `/api/prices` | Route Handler: CoinGecko historical crypto prices → JSON; in-memory cache |
| `/api/assistant` | Route Handler: AI advisor (Claude API, server key); streams text; explains/drafts only, never computes tax numbers |

**Library modules (`src/lib/`):**

- `parsers/` — `universal-csv-parser.ts` (canonical headers: date, type, asset, amount + optional fields) + shared `csv-tokenizer.ts` (RFC-4180 tokenize + header→value objects). Produces transactions, warnings, errors, raw rows.
- `integrations/` — exchange CSV adapters (`adapters/binance.ts`, `adapters/bybit.ts`) normalizing into canonical rows, `registry.ts` (auto-detect by signature headers), `import-exchange-csv.ts` (detect → map → dedup → reuse `parseUniversalCsv`).
- `risk/` — deterministic engine: 9 rules in `risk-rules.ts` (incl. 3 RU bank-trigger rules: rapid_transit, concentrated_counterparty, high_p2p_share), readiness score, `run-risk-engine.ts`.
- `metrics/` — pure analytics functions: fiat flow, data completeness, source coverage, monthly activity.
- `report/` — report preview, document checklist/catalog, derived questions, export filename, source-of-funds pack (`source-of-funds-pack.ts`, `serialize-source-of-funds-pack.ts`, `explanation-letter-templates.ts`).
- `client/` — browser storage helpers (import session, document checklist, partner attribution). Currently `sessionStorage`.
- `persistence/` — saved-report service (local + Supabase variant) + serialization.
- `supabase/` — optional client/server/config (gated, off by default).
- `partners/` — partner attribution logic.
- `demo/` — sample CSV + demo report fixtures.
- `domain/` — shared types (`Transaction`, `TransactionType`, `Finding`, `Report`, etc.).
- `tax/` — deterministic tax engine: `engine/` (types, `calculate-tax.ts`, `build-disposals.ts`), `lots/` (lot builder), `methods/` (shared `match-core.ts` + `fifo`/`lifo`/`hifo`, pooled-average `acb.ts`, registry in `index.ts`), `rates/` (`convert.ts` with `createRateLookup`), `jurisdictions/` (registry `index.ts` with `getJurisdiction`/`JurisdictionInfo`; `ru/` exports resident 13/15% + non-resident 30% profiles; US/UK/DE are planned stubs producing no numbers). Engine is jurisdiction-neutral. Selected jurisdiction is stored client-side via `client/jurisdiction-preference-storage.ts`.
- `portfolio/` — pure portfolio view: `calculate-portfolio.ts` (holdings, valuation, realized/unrealized P&L). Reuses `tax/lots/`, `tax/engine/build-disposals.ts`, and FIFO; withdrawals/transfers are not disposals.
- `assistant/` — AI advisor support: `build-assistant-context.ts` (deterministic snapshot → context + `summarizeFindings`), `assistant-guardrails.ts` (system prompt + request assembly; AI never computes tax numbers), `assistant-client.ts` (browser streaming client). The server route is `app/api/assistant/route.ts`.
- `rates/` — browser clients for external rate/price APIs: `cbr-client.ts` (calls `/api/rates/cbr`), `prices-client.ts` (calls `/api/prices`), `cbr-xml-parser.ts` (pure CBR XML → RateTableEntry[]).

**State model:** all user data lives client-side only (no backend persistence by default).
An `ImportSession` (transactions + warnings + errors + raw rows + risk result) is the central object.

**Tests:** Vitest under `src/tests/`. Factory-helper pattern (`tx(overrides)`, `rawRow()`, `warning()`, `error()`). Run with `npm run test`.

## Product Scope

Crypto Audit Report is being built into a crypto tax + portfolio platform in the class of
Koinly / BitNalog (but aiming to be better), RU-first with an architecture designed for
international markets.

Approved strategic product lines:

- **Crypto Tax Calculator** — deterministic engine with cost-basis lot matching
  (FIFO first; LIFO/HIFO/ACB/weighted-average behind a method abstraction), per-jurisdiction
  rules/rates/forms (RU 3-НДФЛ first), produces a **preliminary** tax figure for review.
- **Portfolio Analytics** — holdings, valuation, realized/unrealized P&L.
- **Import Integrations** — exchange/wallet CSV adapters, read-only API connectors, and
  blockchain address/xpub sync, normalized into the canonical `Transaction`.
- **AI Advisor** — explains results and drafts document/declaration text. The AI NEVER
  produces tax numbers; all numbers come from the deterministic engine.
- **Source-of-Funds Audit Package** — bank/accountant document pack + explanation-letter
  templates (RU 115-ФЗ context), framed as "may require explanation", never as bypass.

All tax-calculator work must ship with methodology, jurisdiction scope,
supported/unsupported operation types, tests, disclaimers, and excluded-from-estimate
behavior. The tax output is always **preliminary, for review with an accountant or tax
consultant** — never an official filing or an official amount due.

The product is NOT:

- a tax-filing product (no automated submission to ФНС or any tax authority);
- a tax-payment product (no collection or remittance of tax);
- an AML certification or AML-scoring product;
- a bank-bypass product;
- legal, tax, financial, or AML advice.

## Repository Boundaries

- Work only inside this repository (`cubafed/nalogrf2`). Use repository-relative paths;
  do not assume any specific absolute checkout location.
- Do not modify sibling projects such as `hrq/`, `cryptondfl-site/`, or `cryptondfl-design-source/`.
- Do not modify files outside this repository.

## Approved Features (require methodology, tests, disclaimers)

These were previously forbidden and are now approved as part of the platform roadmap.
Each must land as a narrow PR with tests, disclaimers, and updated docs:

- deterministic cost-basis engine: FIFO/LIFO/HIFO/ACB/weighted-average lot matching;
- **preliminary** tax-base and tax-amount calculation (per jurisdiction, e.g. RU 13%/15%);
- per-jurisdiction rule/rate/form modules (RU first; others as plugins);
- server-side API route handlers (Next.js Route Handlers) for secrets and proxying;
- external APIs for FX rates (e.g. ЦБ) and historical crypto prices (results cached by date);
- exchange/wallet CSV adapters, read-only API connectors, blockchain address/xpub sync;
- AI advisor — explanations and document/declaration **text drafts** only.

## Forbidden Features (hard bans — never implement)

- automated tax filing / submission to ФНС or any tax authority;
- tax payment, collection, or remittance;
- AML certification or AML scoring;
- presenting any tax number as an official amount due (always "preliminary, for review");
- AI/LLM-generated tax numbers or calculations (numbers come only from the deterministic engine);
- AI/LLM logic for classification, risk rules, or audit decisions (those stay deterministic);
- anything framed as bypassing bank, regulatory, or AML controls.

## Still Gated / Out Of Default Scope

- Supabase / auth / backend persistence (optional, gated, off by default — unchanged);
- payment processing of any kind.

## Financial And Compliance Safety

Never use these phrases in product UI, findings, docs, or summaries:

- suspicious
- dirty funds
- illegal
- AML score
- guaranteed bank approval
- tax optimization
- avoid tax
- bypass bank control

Use safer product language:

- needs review
- review finding
- source-of-funds gap
- missing data
- may require explanation
- could be requested by a bank/accountant

Findings must explain what may need review. Do not make legal conclusions, tax conclusions,
AML conclusions, or claims that funds are clean or dirty.

## Deterministic Logic Rules

- Parser, risk, scoring, tax, portfolio, and report logic must be deterministic and reproducible.
- Do not use AI or LLM logic for calculations, classification, risk rules, tax logic, or audit decisions.
  The AI advisor may explain results and draft text, but never produces or alters tax numbers.
- All tax-calculator work must include methodology, tests, disclaimers, and jurisdiction scope.
- External data (FX rates, historical prices) must be cached by date so a given result is
  reproducible: once a rate/price for a date is fetched, it is fixed and reused.
- Bad or incomplete data should produce structured warnings, errors, or review findings
  (e.g. missing rate / uncovered disposal → `needs_review`), never a guessed value.
- Do not silently drop user-provided rows.
- Preserve raw source data where relevant for auditability.

## Architecture Boundaries

- Parser logic stays in `src/lib/parsers/`.
- Risk logic stays in `src/lib/risk/`.
- Analytics/metrics logic stays in `src/lib/metrics/` (pure, deterministic functions only).
- Tax engine stays in `src/lib/tax/`: lots in `tax/lots/`, cost-basis methods in `tax/methods/`,
  FX/price conversion in `tax/rates/`, per-jurisdiction rules/rates/forms in `tax/jurisdictions/<code>/`.
  The engine core is jurisdiction-neutral; jurisdiction modules apply rates/rules/forms.
- FX-rate and price clients stay in `src/lib/rates/` (with date-keyed caching).
- Portfolio logic stays in `src/lib/portfolio/` (pure, deterministic; reuses `tax/lots/`).
- Import adapters/connectors stay in `src/lib/integrations/` (normalize into `Transaction`).
- Server-only code (secrets, external API proxying, AI advisor) stays in `app/api/*` Route Handlers.
- Report logic stays in `src/lib/report/`.
- Client-only storage stays in `src/lib/client/`.
- UI components stay in `src/components/`, grouped by feature
  (e.g. `src/components/dashboard/`, `src/components/problems/`, `src/components/report/`,
  `src/components/upload/`, `src/components/ui/` for shared primitives).
- Demo fixtures stay in `src/lib/demo/`.
- Domain types stay in `src/lib/domain/`.
- Business logic must not be duplicated inside React components.
- React components may orchestrate parser/risk/metrics calls but must not reimplement
  parser, risk, or metric rules.

## PR Workflow

- One PR equals one narrow feature.
- Keep changes tied to the approved brief.
- Do not add adjacent future features just because they are easy.
- Before final response, always run:

```bash
npm run test
npm run build
```

- Do not report completion if tests or build fail.
- If tests or build fail, fix the failure inside the approved scope or report the blocker clearly.
