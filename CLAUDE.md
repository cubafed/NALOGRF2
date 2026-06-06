@AGENTS.md

## Claude Code

- Follow AGENTS.md as the source of truth for project scope, forbidden features, safety wording, deterministic logic, PR workflow, and architecture boundaries.
- Deterministic tax calculator modules are allowed only as future explicitly approved scope with methodology, tests, disclaimers, and jurisdiction scope.
- Current PRs must not implement tax calculations, tax filing, or tax payment unless explicitly requested in a dedicated approved brief.
- Keep PRs narrow.
- Before reporting completion, run:
  - npm run test
  - npm run build
- Do not report completion if tests or build fail.
- For repeated PR checks, use the crypto-pr-guard skill.
