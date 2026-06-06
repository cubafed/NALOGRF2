@AGENTS.md

## Claude Code

- Follow AGENTS.md as the source of truth for project scope, forbidden features, safety wording, deterministic logic, PR workflow, and architecture boundaries.
- Product positioning: Crypto Audit Report is a crypto audit and tax-readiness product for preparing crypto transaction history for bank, accountant, tax-consultant, and source-of-funds review.
- Current MVP scope: prepare transaction history, review findings, source-of-funds explanations, report previews, document checklists, and local exports.
- Current MVP does not calculate official tax due, does not file tax declarations, and does not provide legal, tax, financial, or AML advice.
- Future deterministic tax-calculation modules may be added only through explicitly approved PRs with clear methodology, jurisdiction scope, tests, and disclaimers.
- Keep PRs narrow.
- Before reporting completion, run:
  - npm run test
  - npm run build
- Do not report completion if tests or build fail.
- For repeated PR checks, use the crypto-pr-guard skill.
