# Codex Working Rules

This repository is the standalone `Crypto Audit Report` app.

## Product Scope

Crypto Audit Report is a crypto audit and tax-readiness product for preparing
crypto transaction history for bank, accountant, tax-consultant, and
source-of-funds review.

The current MVP prepares transaction history, review findings, source-of-funds
explanations, report previews, document checklists, and local exports.

The current MVP is not:

- an official tax calculator;
- a tax filing engine;
- an AML certification product;
- a bank approval product;
- a bank bypass product;
- legal, tax, financial, or AML advice.

Future deterministic tax-calculation modules may be added only through explicitly
approved PRs with clear methodology, jurisdiction scope, tests, and disclaimers.

## Repository Boundaries

- Work only inside `/Users/daviddaler/Documents/crypto-audit-report`.
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
- AML scoring or AML checks
- official tax due calculation
- FIFO/LIFO gain/loss engine
- 3-NDFL filing
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

Findings must explain what may need review. Do not make legal conclusions, tax conclusions,
AML conclusions, or claims that funds are clean or dirty.

## Deterministic Logic Rules

- Parser, risk, scoring, and future report logic must be deterministic and reproducible.
- Do not use AI or LLM logic for calculations, classification, risk rules, tax logic, or audit decisions.
- Future deterministic calculation modules are future scope only and require an
  explicitly approved PR with methodology, jurisdiction scope, tests, and disclaimers.
- Bad or incomplete data should produce structured warnings, errors, or review findings.
- Do not silently drop user-provided rows.
- Preserve raw source data where relevant for auditability.

## Architecture Boundaries

- Parser logic stays in `src/lib/parsers/`.
- Risk logic stays in `src/lib/risk/`.
- Client-only storage stays in `src/lib/client/`.
- UI components stay in `src/components/`.
- Demo fixtures stay in `src/lib/demo/`.
- Domain types stay in `src/lib/domain/`.
- Business logic must not be duplicated inside React components.
- React components may orchestrate parser/risk calls but should not reimplement parser or risk rules.

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
