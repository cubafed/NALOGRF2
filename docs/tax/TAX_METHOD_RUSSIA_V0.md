# Russia Tax Method V0

## Purpose

This document defines the first safe methodology boundary for a future
deterministic crypto tax-readiness calculator. It does not implement
calculations. It does not provide legal advice, tax advice, financial advice,
or official correctness.

The future calculator should produce a preliminary estimate for
accountant/tax-consultant review based only on user-provided data.

## Jurisdiction Assumption

Russia / individual taxpayer / draft personal tax estimate.

This scope is a planning assumption for future implementation. It is not a
statement that the product can file a declaration or determine official tax due.

## User Profile Assumption

The first version assumes an individual user who imports personal crypto
transaction records and wants to prepare a draft calculation for review by an
accountant or tax consultant.

The first version does not cover business/IP status, cross-border residency
issues, corporate accounting, or professional trading status.

## Tax Year Assumption

The first version should operate on a selected calendar tax year only after a
future PR explicitly adds period selection. Until then, this document is only a
methodology boundary.

## Input Data Requirements

Future estimates must be based only on user-provided data. Required input data
for supported operations should include:

- transaction date;
- operation type;
- crypto asset;
- crypto amount;
- fiat proceeds where applicable;
- fiat currency where applicable;
- acquisition cost where available;
- exchange fees if present in CSV;
- source row reference for review.

Rows with incomplete required data must be marked as needs review or excluded
from estimate according to the future module methodology.

## Supported Operation Types For First Calculator Version

The first calculator version may support:

- crypto sold for fiat where fiat proceeds are known;
- P2P crypto sale where fiat proceeds are known;
- manually provided acquisition cost;
- exchange fees if present in CSV;
- simple income/expense summary where source data is explicit.

Support must be limited to deterministic cases with clear input data.

## Unsupported Operation Types For First Calculator Version

The first calculator version must mark these as unsupported in this version
unless a later approved methodology expands scope:

- DeFi;
- liquidity pools;
- bridges;
- NFT;
- staking;
- mining;
- airdrops;
- margin;
- futures;
- options;
- lending;
- borrowing;
- liquidations;
- lost keys;
- gifts;
- inheritance;
- cross-border residency issues;
- business/IP status;
- official 3-NDFL filing;
- tax payment.

## Cost Basis Assumptions

The first version should not implement full FIFO/LIFO unless explicitly
approved in a later PR. Supported cost basis should initially be limited to
manually provided acquisition cost or other explicitly user-provided cost data
that can be traced back to source rows.

Missing acquisition cost must not be guessed. Missing acquisition cost should
produce needs review or excluded from estimate behavior.

## Fee Handling Assumptions

Exchange fees may be included only when present in CSV and linked to a
supported operation. If a fee cannot be linked deterministically, it should be
marked needs review or excluded from estimate.

The first version must not infer missing fees or estimate fees from exchange
rules.

## Missing Data Behavior

Missing required data must never be silently ignored. The future calculator
should mark affected operations as:

- needs review when the user can potentially provide missing data;
- excluded from estimate when the operation cannot be calculated safely in the
  supported methodology.

## Excluded-From-Estimate Behavior

Excluded operations should remain visible in the report. The report should show
why the operation was excluded and what data or methodology support would be
needed for inclusion.

Excluded operations must not be included in draft calculation totals.

## User Review Requirements

Users must review imported data, unsupported operations, missing acquisition
cost, missing fiat values, fee handling, and excluded-from-estimate operations.

The future UI and reports should make review steps explicit.

## Accountant/Tax Consultant Review Recommendation

Every preliminary estimate should be positioned as for accountant/tax-consultant
review. Users should verify the draft calculation and source data with a
qualified professional before relying on the result.

## Known Limitations

This V0 scope does not cover official tax due, official 3-NDFL filing, tax
payment, legal conclusions, tax advice, guaranteed tax correctness, exchange API
sync, DeFi, derivatives, lending, borrowing, mining, staking, airdrops,
cross-border residency issues, or business/IP status.

## Future Scope

Future PRs may add deterministic event classification, acquisition coverage,
manual cost basis input, preliminary estimates for supported operations, export
for accountant/tax-consultant review, and advanced cost basis methods only when
explicitly approved with methodology, jurisdiction scope, tests, and
disclaimers.
