@AGENTS.md

## Claude Code

- Follow AGENTS.md as the source of truth for project scope, forbidden features, safety wording, deterministic logic, PR workflow, and architecture boundaries.
- Keep PRs narrow.
- Before reporting completion, run:
  - npm run verify:pr
- Do not report completion if verification fails.
- For repeated PR checks, use the crypto-pr-guard skill.
