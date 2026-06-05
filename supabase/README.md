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
