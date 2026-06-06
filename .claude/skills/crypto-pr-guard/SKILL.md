# Crypto PR Guard

Use this skill when implementing or reviewing work in the `Crypto Audit Report` repository.
It is a scope, safety, and validation checklist for Claude Code tasks.

## Scope Control

- Confirm the working repository is `cubafed/NALOGRF2`.
- Identify the approved PR number and brief before editing.
- Keep the PR to one narrow feature.
- Do not add future features, routes, services, or integrations unless explicitly approved.
- Product positioning: Crypto Audit Report is a crypto audit and tax-readiness product for
  preparing crypto transaction history for bank, accountant, tax-consultant, and
  source-of-funds review.
- Current MVP scope is transaction history preparation, review findings,
  source-of-funds explanations, report previews, document checklists, and local exports.
- The current MVP does not calculate official tax due, does not file tax declarations,
  and does not provide legal, tax, financial, or AML advice.
- Future deterministic tax-calculation modules may be added only through explicitly
  approved PRs with clear methodology, jurisdiction scope, tests, and disclaimers.

## Forbidden Feature Check

Before and after changes, verify the task did not add:

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
- AML integrations or AML checks
- AML scoring
- official tax due calculation
- FIFO/LIFO gain/loss engine
- 3-NDFL filing
- tax filing
- AI-generated calculations

## Deterministic Logic Check

- Parser logic must live in `src/lib/parsers/`.
- Risk logic must live in `src/lib/risk/`.
- Business logic must not be duplicated inside React components.
- Calculations, parsing, scoring, and rule decisions must be deterministic.
- Do not use LLMs or AI for calculations, classification, risk findings, or tax decisions.
- Preserve raw source data where the feature touches user-provided rows.

## Financial/Compliance Language Check

Avoid unsafe language:

- suspicious
- dirty funds
- illegal
- AML score
- guaranteed bank approval
- tax optimization
- avoid tax
- bypass bank control

Prefer:

- tax-readiness
- accountant review
- tax-consultant review
- source-of-funds review
- report preparation
- needs review
- review finding
- source-of-funds gap
- missing data
- may require explanation
- could be requested by a bank/accountant
- document checklist

Findings should organize information and explain review needs. They must not provide legal,
tax, financial, or AML advice.

## Architecture Boundary Check

- `src/lib/parsers/`: parsing and import validation.
- `src/lib/risk/`: deterministic risk/review rules and scoring.
- `src/lib/client/`: browser-only state or local storage helpers.
- `src/components/`: UI components and orchestration only.
- `src/lib/demo/`: demo/sample fixtures.
- `src/lib/domain/`: shared domain types.

If a change crosses these boundaries, stop and justify it against the approved PR brief.

## Validation

Before reporting completion, run:

```bash
npm run test
npm run build
```

Completion is not valid if either command fails.

In the final response, summarize:

- files changed;
- whether forbidden features were avoided;
- test result;
- build result;
- any known limitations.
