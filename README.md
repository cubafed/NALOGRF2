# Crypto Audit Report

Dark fintech/compliance landing and static demo report for a future Crypto Source-of-Funds & Tax Audit product.

Primary message:

> Подготовьте криптоисторию для банка, бухгалтера и налоговой

## Current Scope

- New standalone Next.js + TypeScript + Tailwind app.
- Landing page at `/`.
- Static demo report page at `/demo`.
- Browser-only Universal CSV upload preview at `/upload`.
- Deterministic review finding engine and problems dashboard.
- Browser-only report preview and print/save-as-PDF action.
- Static partner pages and local partner attribution skeleton.
- Optional Supabase auth and persistence foundation for future cloud save flows.
- Stable TypeScript domain and partner types.
- Vitest tests for demo data, parser, storage, risk, report, partner attribution,
  Supabase config, and report serialization.

## What Is Mocked

- Demo audit data.
- Partner referral metadata and demo partner links.
- Future exchange/accountant partner flows.
- PDF export filename suggestion; browser print controls final save behavior.
- Supabase save/list flows when no project is configured locally.

## What Is Not Implemented

- Backend PDF generation.
- Payments.
- Required auth.
- Required Supabase runtime.
- Partner dashboard.
- Backend analytics.
- Affiliate payouts.
- Exchange APIs.
- AML checks.
- Country-specific tax filing.
- AI-generated calculations.

## Pages

- `/` — landing.
- `/demo` — static demo report.
- `/upload` — browser-only CSV import, parser preview and review findings.
- `/problems` — problems dashboard built from the latest local import/risk session.
- `/report` — browser-only structured report preview built from the latest local
  import/risk session (`src/lib/report/`). Not PDF generation. Reads the session
  from `sessionStorage`, summarizes findings, groups documents, and derives
  deterministic review questions from existing findings. Shows an empty state with
  a CTA to `/upload` when no local session exists.
- `/partners` — static partner overview page for future exchange, accountant,
  consultant, community, education, and OTC flows.
- `/partners/exchanges` — static partner page for crypto exchanges and P2P
  communities. Current MVP supports Universal CSV only.
- `/partners/accountants` — static partner page for accountants and tax
  consultants. This is not tax advice and not a filing engine.
- `/account` — optional Supabase auth foundation. The app works when Supabase is
  not configured.
- `/saved-reports` — optional saved reports foundation. Shows unavailable or
  authenticated placeholder states depending on Supabase/auth state.

## Local Partner Attribution

Partner links can include `partner`, `ref`, and UTM parameters. On `/upload`,
the app parses those parameters and stores only that metadata in `localStorage`.
No uploaded CSV data is stored in partner attribution storage, and no partner
metadata is sent to a backend in this MVP.

## Supabase Foundation

Supabase is optional. The app builds and runs without these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

When configured, `/account` exposes a basic email magic-link sign-in skeleton and
`/report` can attempt an explicit authenticated save of a serialized report
draft. Raw CSV files are not uploaded automatically, and no service role keys are
used in browser code.

Database schema and storage notes live in `supabase/`.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test And Build

```bash
npm run test
npm run build
```

The production build does not require environment variables.

## PR Verification

Local:

```bash
npm run verify:pr
```

CI:

```bash
npm run verify:ci
```

This runs tests, build, diff summary, changed files, and forbidden-scope checks.

## Next Planned PRs

1. Add Supabase project QA with a real test project and documented manual setup.
2. Add explicit file upload-to-storage action for authenticated users.
3. Add saved report detail view without changing parser/risk logic.
