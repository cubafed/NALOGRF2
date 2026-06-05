create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text
);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  file_name text,
  readiness_score integer not null,
  readiness_label text not null,
  parser_summary jsonb not null,
  risk_summary jsonb not null,
  report_preview jsonb not null,
  partner_attribution jsonb,
  source_type text not null default 'local_upload'
);

create table if not exists public.report_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_report_id uuid references public.saved_reports(id) on delete cascade,
  created_at timestamptz not null default now(),
  storage_bucket text not null,
  storage_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_saved_reports_updated_at on public.saved_reports;
create trigger set_saved_reports_updated_at
before update on public.saved_reports
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.saved_reports enable row level security;
alter table public.report_files enable row level security;

drop policy if exists "Users can select own profile" on public.profiles;
create policy "Users can select own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles for delete
using (auth.uid() = id);

drop policy if exists "Users can select own saved reports" on public.saved_reports;
create policy "Users can select own saved reports"
on public.saved_reports for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved reports" on public.saved_reports;
create policy "Users can insert own saved reports"
on public.saved_reports for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own saved reports" on public.saved_reports;
create policy "Users can update own saved reports"
on public.saved_reports for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved reports" on public.saved_reports;
create policy "Users can delete own saved reports"
on public.saved_reports for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own report files" on public.report_files;
create policy "Users can select own report files"
on public.report_files for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own report files" on public.report_files;
create policy "Users can insert own report files"
on public.report_files for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own report files" on public.report_files;
create policy "Users can update own report files"
on public.report_files for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own report files" on public.report_files;
create policy "Users can delete own report files"
on public.report_files for delete
using (auth.uid() = user_id);
