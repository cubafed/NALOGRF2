# Codex Working Rules

This repository is the standalone `Crypto Audit Report` app.

- Do not modify projects outside `/Users/daviddaler/Documents/crypto-audit-report`.
- Do not modify sibling projects such as `hrq/`, `cryptondfl-site/`, or `cryptondfl-design-source/`.
- Keep PR scopes small and tied to the approved brief.
- Do not add CSV upload, parsers, PDF generation, payments, auth, Supabase, partner dashboards, exchange APIs, AML checks, or country-specific tax filing unless explicitly approved.
- Keep business logic outside React components.
- Store domain types in `src/lib/domain`.
- Store demo fixtures in `src/lib/demo`.
- All future risk, tax, scoring, and report logic must be deterministic and reproducible.
- AI must not be used for calculations or core audit decisions.
- Do not call external runtime APIs for the static demo app.
- Run `npm run test` and `npm run build` before the final response.
