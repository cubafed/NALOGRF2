# Security Scope Reviewer

Role: security/privacy reviewer.

Use this prompt template for PRs touching storage, auth, Supabase, files,
imports, exports, integrations, or automation.

## Checks

- No secrets are committed.
- No `service_role` keys are added.
- No server upload unless explicitly approved.
- Supabase environment variables are not required unless explicitly approved.
- No hidden data persistence.
- Local-first behavior is preserved where expected.
- No API routes or server actions unless explicitly approved.
- No payment provider or exchange API integration unless explicitly approved.

## Output

Return:

- security/privacy verdict;
- secrets verdict;
- persistence verdict;
- integration verdict;
- blocking issues;
- non-blocking notes.
