@AGENTS.md

## Claude Code

- Follow AGENTS.md as the source of truth for project scope, forbidden features, safety wording, deterministic logic, PR workflow, and architecture boundaries.
- Keep PRs narrow.
- Before reporting completion, run:
  - npm run test
  - npm run build
- Do not report completion if tests or build fail.
- For repeated PR checks, use the crypto-pr-guard skill.
