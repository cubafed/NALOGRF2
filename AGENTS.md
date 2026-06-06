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

**Library modules (`src/lib/`):**

- `parsers/` — `universal-csv-parser.ts` (canonical headers: date, type, asset, amount + optional fields). Produces transactions, warnings, errors, raw rows.
- `risk/` — deterministic engine: 6 rules in `risk-rules.ts`, readiness score, `run-risk-engine.ts`.
- `metrics/` — pure analytics functions: fiat flow, data completeness, source coverage, monthly activity.
- `report/` — report preview, document checklist/catalog, derived questions, export filename.
- `client/` — browser storage helpers (import session, document checklist, partner attribution). Currently `sessionStorage`.
- `persistence/` — saved-report service (local + Supabase variant) + serialization.
- `supabase/` — optional client/server/config (gated, off by default).
- `partners/` — partner attribution logic.
- `demo/` — sample CSV + demo report fixtures.
- `domain/` — shared types (`Transaction`, `TransactionType`, `Finding`, `Report`, etc.).

**State model:** all user data lives client-side only (no backend persistence by default).
An `ImportSession` (transactions + warnings + errors + raw rows + risk result) is the central object.

**Tests:** Vitest under `src/tests/`. Factory-helper pattern (`tx(overrides)`, `rawRow()`, `warning()`, `error()`). Run with `npm run test`.

## Product Scope

Crypto Audit Report helps users prepare crypto transaction history for a bank, accountant,
tax consultant, or source-of-funds review.

This is not:

- a tax filing product;
- an AML certification product;
- a bank bypass product;
- legal, tax, financial, or AML advice.

## Repository Boundaries

- Work only inside this repository (`cubafed/nalogrf2`). Use repository-relative paths;
  do not assume any specific absolute checkout location.
- Do not modify sibling projects such as `hrq/`, `cryptondfl-site/`, or `cryptondfl-design-source/`.
- Do not modify files outside this repository.

## Forbidden Features Unless Explicitly Approved

- Supabase
- auth
- payment
- PDF generation
- backend persistence
- API routes
- server actions
- Binance parser
- Bybit parser
- exchange APIs
- AML integrations
- tax filing
- AI-generated calculations

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

- Parser, risk, scoring, and future report logic must be deterministic and reproducible.
- Do not use AI or LLM logic for calculations, classification, risk rules, tax logic, or audit decisions.
- Bad or incomplete data should produce structured warnings, errors, or review findings.
- Do not silently drop user-provided rows.
- Preserve raw source data where relevant for auditability.

## Architecture Boundaries

- Parser logic stays in `src/lib/parsers/`.
- Risk logic stays in `src/lib/risk/`.
- Analytics/metrics logic stays in `src/lib/metrics/` (pure, deterministic functions only).
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
