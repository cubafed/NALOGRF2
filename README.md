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
- Browser-only analytics dashboard at `/dashboard`, built from the latest local
  import session and existing deterministic review findings.
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
- Server-side analytics storage or event tracking.
- Affiliate payouts.
- Exchange APIs.
- AML checks.
- Country-specific tax filing.
- AI-generated calculations.

## Pages

- `/` — landing.
- `/demo` — static demo report.
- `/upload` — browser-only CSV import, parser preview and review findings.
- `/dashboard` — browser-only analytics dashboard built from the latest local
  import/risk session. It summarizes import quality, source coverage,
  source-of-funds review metrics, report readiness, monthly activity, finding
  severity, and transaction type breakdowns. It does not call external APIs and
  does not calculate new risk findings.
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
  not configured. When Supabase is configured, it supports email magic-link sign-in
  and sign-out.
- `/saved-reports` — optional saved reports list. Shows unavailable/sign-in states
  without Supabase/auth, and lists authenticated Supabase `saved_reports` rows when
  available.
- `/saved-reports/[id]` — saved report metadata/detail view from the persisted row
  with explicit PDF attachment upload when Supabase Storage is configured.

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

When configured, `/account` exposes email magic-link sign-in and sign-out.
`/report` can explicitly save the current serialized report draft for an
authenticated user. `/saved-reports` lists saved report metadata and links to
`/saved-reports/[id]`.

On `/saved-reports/[id]`, authenticated users can explicitly attach a PDF report
file to a saved report. Raw CSV files are not uploaded automatically or manually
in this PR, and no service role keys are used in browser code.

Database schema and storage notes live in `supabase/`.

## Supabase Manual Verification

1. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

2. Apply `supabase/migrations/0001_initial_schema.sql` to the Supabase project.
3. Start the dev server with `npm run dev`.
4. Open `/account` and sign in with email magic link.
5. Open `/upload` and use the sample CSV.
6. Go to `/problems`, then `/report`.
7. Click `Сохранить отчет`.
8. Open `/saved-reports` and confirm the saved report appears.
9. Open the saved report detail page.
10. Select a PDF file and click `Загрузить PDF`.
11. Confirm the attached file metadata appears on the detail page.

Storage upload is explicit and PDF-only. Payment, tax filing, exchange APIs,
external analytics, raw CSV upload, automatic upload, and server-side PDF
generation are not implemented.

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

## Next Planned PRs

1. Add signed download links for attached report files.
2. Add saved report delete/archive UI.
3. Add analytics export planning without backend calculations.
