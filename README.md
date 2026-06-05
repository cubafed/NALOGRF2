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
- Stable TypeScript domain and partner types.
- Vitest tests for demo data, parser, storage, risk, report, and partner attribution.

## What Is Mocked

- Demo audit data.
- Partner referral metadata and demo partner links.
- Future exchange/accountant partner flows.
- PDF export filename suggestion; browser print controls final save behavior.

## What Is Not Implemented

- Backend PDF generation.
- Payments.
- Auth.
- Supabase.
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

## Local Partner Attribution

Partner links can include `partner`, `ref`, and UTM parameters. On `/upload`,
the app parses those parameters and stores only that metadata in `localStorage`.
No uploaded CSV data is stored in partner attribution storage, and no partner
metadata is sent to a backend in this MVP.

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

1. Add visible report export polish after PR7/PR8 review.
2. Add importer format planning without implementing exchange-specific parsers.
3. Add partner conversion copy experiments without backend analytics or payouts.
