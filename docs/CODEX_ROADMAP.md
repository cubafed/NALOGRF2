# Codex Roadmap — Crypto Audit Report

This file is the working brief for an agent (Codex) picking up development.
Read `AGENTS.md` first (scope, forbidden features, safety wording, architecture,
Project State). This file lists the approved upcoming PRs.

## How to work here

1. Read `AGENTS.md` end to end. It overrides any default behaviour.
2. One PR = one narrow feature from the list below. Do not bundle features.
3. Keep deterministic logic in `src/lib/*`; keep UI in `src/components/*`.
   Never reimplement parser/risk/metric rules inside React components.
4. Respect the forbidden-features list. If a task seems to require one, stop and
   ask before implementing.
5. Respect the safety wording list. Never use "suspicious", "AML score", "tax
   optimization", "bypass bank control", etc. Use "needs review",
   "source-of-funds gap", "may require explanation", "could be requested by a
   bank/accountant".
6. Before reporting completion, ALWAYS run:
   ```bash
   npm run test
   npm run build
   ```
   Do not report completion if either fails.
7. After a feature lands, update the **Project State** section in `AGENTS.md`
   (new route / lib module / major component) so the next agent stays in sync.

## Definition of done (every PR)

- [ ] Feature matches its one-line brief, nothing extra.
- [ ] Deterministic + local-only (no backend, no external API, no AI calc).
- [ ] New pure logic has Vitest tests (factory-helper pattern).
- [ ] No forbidden feature added; no forbidden wording used.
- [ ] `npm run test` and `npm run build` both pass.
- [ ] `AGENTS.md` Project State updated if routes/modules changed.

## Approved PR backlog

Implement in order. Each row is a complete, narrow PR.

### PR 14 — Local draft persistence
Move the import session from `sessionStorage` to `localStorage` so a refresh or a
closed tab does not lose the user's work. Add an explicit "Clear local data"
control. Keep all data client-side. Tests: storage round-trip, clear, version
guard. No UI logic duplicated; reuse `src/lib/client/`.

### PR 15 — CSV column mapping
When an uploaded CSV does not match the canonical headers, let the user map their
columns to canonical fields (date, type, asset, amount, + optional) in the UI.
Generic mapping only — NOT exchange-specific parsers. Mapping logic is a pure
function in `src/lib/parsers/` (e.g. `apply-column-mapping.ts`) with tests.

### PR 16 — Multi-file merge
Allow importing several CSV files into one session. Deduplicate by `txHash` when
present; otherwise keep all rows (never silently drop). Merge logic is a pure
function with tests (dedup, conflict, order preservation). Surface a summary of
merged/deduped counts.

### PR 17 — Date-range / period filter
Add a global period filter (e.g. tax year or custom range) applied across
`/problems`, `/report`, and `/dashboard`. Filter is a pure helper over
transactions with tests (inclusive bounds, invalid dates excluded explicitly,
empty range). UI: a small period selector in the relevant page headers.

### PR 18 — Annotate findings
Let the user attach a note and a list of supporting documents to each review
finding, stored locally. Annotations flow into the report output. Storage helper
in `src/lib/client/`; do not change risk rules. Tests for the storage helper.

### PR 19 — Acquisition coverage v2  ⚠️ wording review
Improve `missing_cost_basis_basic` into lot-level acquisition coverage: for each
disposal, determine whether earlier acquisition history exists for that asset.
Report COVERAGE ONLY (history present / missing). Do NOT compute gain/loss, tax,
or cost basis amounts — that is out of scope. Keep it in `src/lib/risk/` with
tests. Review every user-facing string against the safety list.

### PR 20 — Per-asset breakdown
On `/dashboard`, add a per-asset view: net position over time and activity per
asset, computed deterministically from the session. New pure metric function in
`src/lib/metrics/` with tests. Reuse existing chart components where possible.

### PR 21 — Findings → checklist link
Auto-link each finding's `documentsNeeded` to the report's document checklist, so
required documents are pre-populated from triggered findings. Mapping is a pure
function in `src/lib/report/` with tests. No new risk rules.

### PR 22 — EN / RU i18n toggle
Add a language toggle (RU default, EN secondary) for UI strings. Front-end only,
no backend. Keep all product/safety wording rules in both languages. Centralize
strings; do not hardcode duplicated copy across components.

### PR 23 — Export findings (CSV / JSON)  ⚠️ confirm not "PDF generation"
Let the user export findings and the audit package as CSV/JSON via a client-side
`Blob` download (NOT server-side PDF generation, which is forbidden). Build the
export payload with a pure function in `src/lib/report/` with tests.

## Notes / guardrails specific to this backlog

- PR 19 and PR 23 are flagged: they sit near forbidden lines (tax calculation /
  PDF generation). Stay on the safe side of the line and confirm if unsure.
- Do NOT add: Supabase as a default, auth requirements, payments, API routes,
  server actions, exchange (Binance/Bybit) parsers, exchange APIs, AML
  integrations, tax filing, or AI-generated calculations.
- Prefer extending existing pure-function + Vitest patterns over new frameworks.
