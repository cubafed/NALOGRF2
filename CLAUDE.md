@AGENTS.md

## Claude Code

- Follow AGENTS.md as the source of truth for project scope, approved/forbidden features, safety wording, deterministic logic, PR workflow, and architecture boundaries.
- The deterministic tax calculator (FIFO/cost-basis, RUB conversion, NDFL rate → preliminary amount) is approved scope; ship it with methodology, tests, disclaimers, and jurisdiction scope.
- Tax output is always preliminary, for review with an accountant — never an official filing or official amount due. No automated filing, no tax payment, no AI-generated tax numbers.
- Keep PRs narrow.
- Before reporting completion, run:
  - npm run test
  - npm run build
- Do not report completion if tests or build fail.
- For repeated PR checks, use the crypto-pr-guard skill.
