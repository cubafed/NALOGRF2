# Crypto PR Guard

Use this skill when implementing or reviewing work in the `Crypto Audit Report` repository.
It is a scope, safety, and validation checklist for future Codex tasks.

## Scope Control

- Confirm the target directory is `/Users/daviddaler/Documents/crypto-audit-report`.
- Identify the approved PR number and brief before editing.
- Keep the PR to one narrow feature.
- Do not add future features, routes, services, or integrations unless explicitly approved.
- Deterministic tax calculator modules are allowed only as future explicitly approved
  scope with methodology, jurisdiction scope, supported/unsupported operation types,
  tests, disclaimers, and excluded-from-estimate behavior.

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
- tax filing
- tax payment
- official tax due calculation
- FIFO/LIFO gain/loss engine
- AI-generated calculations

## Deterministic Logic Check

- Parser logic must live in `src/lib/parsers/`.
- Risk logic must live in `src/lib/risk/`.
- Business logic must not be duplicated inside React components.
- Calculations, parsing, scoring, and rule decisions must be deterministic.
- Do not use LLMs or AI for calculations, classification, risk findings, or tax decisions.
- Current PRs must not implement tax calculations unless explicitly requested in the approved brief.
- All future tax calculator work must include methodology, tests, disclaimers, and jurisdiction scope.
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

- needs review
- review finding
- source-of-funds gap
- missing data
- may require explanation
- could be requested by a bank/accountant

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
