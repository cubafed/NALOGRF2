# Supabase Foundation

This folder documents the intended Supabase foundation for future authenticated
persistence. The local browser MVP must continue to work when Supabase is not
configured.

## Environment

Use public browser-safe variables only:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not use service role keys in browser code and do not commit real credentials.

## Migration

`migrations/0001_initial_schema.sql` creates:

- `profiles`
- `saved_reports`
- `report_files`

RLS is enabled on every table. Users can select, insert, update, and delete only
their own rows.

Apply the migration through the Supabase dashboard SQL editor or your local
Supabase CLI workflow. This repo does not require Supabase env vars to build.

## Manual Save/List Verification

1. Create `.env.local` in the app root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

2. Apply `migrations/0001_initial_schema.sql`.
3. Run `npm run dev`.
4. Open `/account` and sign in with email magic link.
5. Open `/upload`, use the sample CSV, then continue to `/problems` and `/report`.
6. Click `Сохранить отчет`.
7. Open `/saved-reports` and confirm the saved report row appears.
8. Open a saved report detail page.

The app must continue to work when Supabase env vars are absent.

## Storage Bucket

Intended future bucket:

```text
crypto-audit-user-files
```

Planned rules:

- private bucket;
- users can access only their own folder: `user_id/*`;
- raw CSV uploads are not automatic;
- a future PR may add an explicit upload-to-storage action.

Do not create the bucket from app code in this PR.

Payment, tax filing, exchange APIs, storage upload, external analytics, and
server-side PDF generation are not implemented.
