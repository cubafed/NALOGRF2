# Tax Roadmap

## Purpose

This roadmap defines a safe PR sequence for deterministic tax-readiness work.
It does not implement calculations.

## TAX-METHOD-0

- Methodology and scope docs only.
- No app behavior changes.
- No tax calculations.
- No official tax due.
- No tax filing.

## TAX-1

- Deterministic taxable event classifier.
- No amounts.
- No official tax due.
- Must include tests and classification disclaimers.

## TAX-2

- Acquisition coverage and manual cost basis input.
- Local-only.
- No full FIFO/LIFO yet.
- Missing acquisition data must remain needs review or excluded from estimate.

## TAX-3

- Preliminary tax estimate for supported operations only.
- Included/excluded/needs-review breakdown.
- No guaranteed tax correctness.
- No official tax filing.

## TAX-4

- How-to-pay guide.
- No tax payment processing.
- Official-channel instructions only.
- Must not collect or process tax payments.
- Implemented by TAX-GUIDE-1: "Следующие шаги" panel on `/tax` with checklist,
  disclaimer, methodology note, and official-channel instructions only.

## TAX-5

- Tax summary export for accountant/tax-consultant.
- Client-side export only.
- No backend filing.
- Implemented by TAX-GUIDE-1: client-side `tax-summary.json` / `tax-summary.csv`
  export via Blob (`build-tax-summary-export.ts`), plus copy-for-accountant.

## TAX-6

- Optional advanced cost basis methods only after explicit approval.
- Must include methodology, jurisdiction scope, tests, and disclaimers.

## Cross-Cutting Requirements

All tax PRs must preserve deterministic behavior, avoid AI-generated
calculations, keep unsupported operations visible, and clearly distinguish
preliminary tax-readiness estimates from official tax filing or tax advice.
