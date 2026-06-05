# Crypto Audit Report

Dark fintech/compliance landing and static demo report for a future Crypto Source-of-Funds & Tax Audit product.

Primary message:

> Подготовьте криптоисторию для банка, бухгалтера и налоговой

## Current PR #1 Scope

- New standalone Next.js + TypeScript + Tailwind app.
- Landing page at `/`.
- Static demo report page at `/demo`.
- Stable TypeScript domain types.
- Typed demo fixture.
- Vitest tests for demo data consistency.

## What Is Mocked

- Demo audit data.
- Risk and readiness metrics.
- Findings and report preview sections.
- Calls to future upload, PDF, partner, and payment flows are placeholders only.

## What Is Not Implemented

- CSV upload.
- CSV parsers.
- PDF generation.
- Payments.
- Auth.
- Supabase.
- Partner dashboard.
- Exchange APIs.
- AML checks.
- Country-specific tax filing.
- AI-generated calculations.

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

1. Add deterministic CSV parser foundation for universal, Binance, and Bybit fixtures.
2. Add upload page and import preview with validation.
3. Add deterministic risk engine and findings from normalized transactions.
4. Add problems and transactions pages.
5. Add report preview snapshots and later PDF generation.
