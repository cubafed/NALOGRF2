# Tax Event Classification

## Purpose

This document defines future deterministic classifier categories for tax-readiness
work. It does not change code and does not implement tax calculations.

Every operation must be assigned to a category. No operation should silently
disappear.

## Categories

- `taxable_candidate` — operation may be included in a future preliminary
  estimate when all required data is present and the methodology supports it.
- `non_taxable_candidate` — operation is not itself a taxable disposal in the
  current methodology, but may matter for source, acquisition history, or
  review.
- `needs_review` — operation may require user/accountant/tax-consultant review
  because data, source, or classification is incomplete.
- `unsupported` — operation type is outside the supported methodology for the
  current calculator version.
- `excluded_from_estimate` — operation must be visible but excluded from draft
  calculation totals.

## Draft Mapping From Current TransactionType

These are future mapping ideas only. They should not be treated as implemented
behavior until a dedicated TAX PR adds deterministic code and tests.

| TransactionType | Draft classification |
|---|---|
| `sell` | `taxable_candidate` if fiat value exists; `needs_review` if fiat value is missing |
| `p2p` sale/inflow/outflow | `needs_review` unless proceeds and acquisition data are explicit |
| `buy` | `non_taxable_candidate` for disposal calculation, but relevant for acquisition cost history |
| `deposit` | `non_taxable_candidate` or `needs_review` depending on source |
| `withdrawal` | `non_taxable_candidate` or `needs_review` depending on destination |
| `transfer` | `non_taxable_candidate` if self-transfer is clear; `needs_review` otherwise |
| `conversion` | `unsupported` in first tax estimate unless methodology is explicitly approved |
| `income` | `needs_review` or `unsupported` unless source and fiat value are explicit |
| `fee` | deductible/expense candidate only when linked to a supported taxable event |
| `unknown` | `excluded_from_estimate` |

## Classification Rules

- No operation should silently disappear.
- Unsupported operations must remain visible.
- Missing fiat value, missing acquisition cost, unclear source, or unclear
  destination should produce `needs_review` or `excluded_from_estimate`.
- A classifier must not infer missing facts from exchange names, wallet labels,
  or user notes unless a future approved methodology defines deterministic
  rules.
- Classifier output must be deterministic and covered by tests.
