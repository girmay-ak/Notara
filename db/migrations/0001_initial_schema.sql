-- Notara — initial schema (M2)
-- profiles, patients, notes, subscriptions, audit_log, stripe_events
-- All public tables have RLS enabled with per-operation policies.
-- Region: eu-west-1 (EU). PHI minimised; audio deleted after transcription.
--
-- Source of truth: docs/BLUEPRINT.md §3, adapted per docs/V1-REQUIREMENTS.md
-- (card-free trial; patients table present but no UI until v1.1).

-- ───────────────────────────── enums ─────────────────────────────
do $$ begin
  create type public.profession as enum
    ('physiotherapist','psychologist','gp','coach','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.note_format as enum ('kngf','soap');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.note_status as enum ('processing','completed','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum
    ('trialing','active','past_due','canceled','incomplete');
exception when duplicate_object then null; end $$;

-- ─────────────────────────── functions ───────────────────────────
-- updated_at maintenance (explicit empty search_path for security).
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create profile + trialing subscription on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  insert into public.subscriptions (user_id, status, trial_end)
  values (new.id, 'trialing', now() + interval '14 days');
  return new;
end;
$$;

-- ──────────────────────────── tables ─────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  profession public.profession not null default 'physiotherapist',
  preferred_language text not null default 'nl',
  preferred_format public.note_format not null default 'kngf',
  practice_name text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  onboarded_at timestamptz,
  feature_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pseudonymous patients (no DOB, no BSN). Schema only in v1.0; UI in v1.1.
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  external_ref text,
  notes_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists idx_patients_user
  on public.patients(user_id) where archived_at is null;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  format public.note_format not null,
  status public.note_status not null default 'processing',
  language text not null default 'nl',
  audio_path text,                      -- nulled after transcription (≤60s)
  audio_deleted_at timestamptz,
  transcript text,
  content jsonb,
  rendered_text text,
  duration_seconds int,
  whisper_cost_cents numeric(8,4),
  claude_input_tokens int,
  claude_output_tokens int,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_notes_user_created
  on public.notes(user_id, created_at desc);
create index if not exists idx_notes_patient on public.notes(patient_id);
create index if not exists idx_notes_processing
  on public.notes(status) where status = 'processing';

-- 1:1 with profile, mirrored from Stripe (written only via service role).
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status public.subscription_status not null default 'trialing',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_subs_customer
  on public.subscriptions(stripe_customer_id);

-- Append-only audit trail (written only via service role).
create table if not exists public.audit_log (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_user_time
  on public.audit_log(user_id, created_at desc);

-- Stripe webhook idempotency.
create table if not exists public.stripe_events (
  id text primary key,                  -- Stripe event id
  type text not null,
  received_at timestamptz not null default now()
);

-- ──────────────────────────── triggers ───────────────────────────
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_patients_updated on public.patients;
create trigger trg_patients_updated before update on public.patients
  for each row execute function public.set_updated_at();

drop trigger if exists trg_notes_updated on public.notes;
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subs_updated on public.subscriptions;
create trigger trg_subs_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────── RLS ──────────────────────────────
alter table public.profiles      enable row level security;
alter table public.patients      enable row level security;
alter table public.notes         enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_log     enable row level security;
alter table public.stripe_events enable row level security;

-- profiles: owner read/update (insert handled by trigger via service role).
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- patients: full owner CRUD.
create policy "patients_select_own" on public.patients
  for select to authenticated using (user_id = (select auth.uid()));
create policy "patients_insert_own" on public.patients
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "patients_update_own" on public.patients
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "patients_delete_own" on public.patients
  for delete to authenticated using (user_id = (select auth.uid()));

-- notes: full owner CRUD.
create policy "notes_select_own" on public.notes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "notes_insert_own" on public.notes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "notes_update_own" on public.notes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notes_delete_own" on public.notes
  for delete to authenticated using (user_id = (select auth.uid()));

-- subscriptions: owner read only; writes via service role (Stripe webhook).
create policy "subs_select_own" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

-- audit_log: owner read only; inserts via service role.
create policy "audit_select_own" on public.audit_log
  for select to authenticated using (user_id = (select auth.uid()));

-- stripe_events: no authenticated access (service role only).

-- ───────────────────────────── storage ───────────────────────────
-- Private audio bucket; path layout audio/{user_id}/{note_id}.{ext}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio','audio', false, 5242880,
        array['audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav'])
on conflict (id) do nothing;

create policy "audio_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "audio_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "audio_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "audio_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
