-- Harden RLS + create missing log tables
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
--
-- This migration does three things:
--   1. Creates tummy_time_logs, medicine_logs, temperature_logs, growth_logs,
--      which the app has been writing to since Phase 2/3 but which were never
--      actually created in this project (every save on those four screens has
--      been failing with "Could not find the table" until now).
--   2. Adds a missing uniqueness guarantee on household_members so the same
--      user can't end up with two membership rows in the same household.
--   3. Enables Row Level Security on every table (it has been off everywhere,
--      meaning the anon key could read/write any row in the project) and adds
--      policies matching the household/role model already implied by the app:
--        - a user can only see/write data for babies in households they belong to
--        - 'viewer' is read-only everywhere
--        - 'owner'/'parent' are the only roles that can invite new caregivers
--        - 'owner'/'parent'/'caregiver' can all edit/delete any log entry in
--          their household (not just entries they personally created) — this
--          fits a shared co-parenting app where a partner should be able to
--          fix a typo in a feed someone else logged
--
-- Safe to run against the live project: CREATE TABLE IF NOT EXISTS, ADD
-- CONSTRAINT IF NOT EXISTS-equivalent guards, and CREATE OR REPLACE / DROP
-- POLICY IF EXISTS are used throughout so this can be re-run without error.

-- ============================================================================
-- 1. Missing log tables
-- ============================================================================

create table if not exists public.tummy_time_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tummy_time_logs_baby_id_idx on public.tummy_time_logs(baby_id);

create table if not exists public.medicine_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  medicine_name text not null,
  dosage text,
  given_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists medicine_logs_baby_id_idx on public.medicine_logs(baby_id);

create table if not exists public.temperature_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  temperature numeric not null,
  unit text not null check (unit in ('C', 'F')),
  taken_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists temperature_logs_baby_id_idx on public.temperature_logs(baby_id);

create table if not exists public.growth_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  weight numeric,
  height numeric,
  head_circumference numeric,
  weight_unit text,
  height_unit text,
  measured_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_logs_baby_id_idx on public.growth_logs(baby_id);

-- Note: weight_unit/height_unit are left nullable with no check constraint on
-- purpose. app/growth/add.tsx currently reads userPreferences.heightUnit,
-- which doesn't exist on the preferences store (only weightUnit does) — that's
-- a separate pre-existing app bug, not something this migration should paper
-- over with a NOT NULL/CHECK that would turn it into a hard insert failure.

-- ============================================================================
-- 2. Data integrity fix: prevent duplicate household memberships
-- ============================================================================

alter table public.household_members
  drop constraint if exists household_members_household_id_user_id_key;
alter table public.household_members
  add constraint household_members_household_id_user_id_key unique (household_id, user_id);

-- ============================================================================
-- 3. Helper functions (SECURITY DEFINER to safely break RLS self-recursion
--    when a household_members policy needs to query household_members itself)
-- ============================================================================

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.household_role(target_household_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.household_members
  where household_id = target_household_id
    and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_write_household(target_household_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.household_role(target_household_id) in ('owner', 'parent', 'caregiver');
$$;

create or replace function public.can_manage_household(target_household_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.household_role(target_household_id) in ('owner', 'parent');
$$;

create or replace function public.household_id_for_baby(target_baby_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from public.babies where id = target_baby_id;
$$;

grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.household_role(uuid) to authenticated;
grant execute on function public.can_write_household(uuid) to authenticated;
grant execute on function public.can_manage_household(uuid) to authenticated;
grant execute on function public.household_id_for_baby(uuid) to authenticated;

-- ============================================================================
-- 4. Enable RLS everywhere
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.babies enable row level security;
alter table public.feeding_logs enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.nappy_logs enable row level security;
alter table public.tummy_time_logs enable row level security;
alter table public.medicine_logs enable row level security;
alter table public.temperature_logs enable row level security;
alter table public.growth_logs enable row level security;
alter table public.milestones enable row level security;
alter table public.photos enable row level security;

-- ============================================================================
-- 5. profiles
-- ============================================================================

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1 from public.household_members m1
    join public.household_members m2 on m1.household_id = m2.household_id
    where m1.user_id = auth.uid() and m2.user_id = profiles.id
  )
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- ============================================================================
-- 6. households
-- ============================================================================

drop policy if exists households_select on public.households;
create policy households_select on public.households
for select
using (public.is_household_member(id));

drop policy if exists households_insert on public.households;
create policy households_insert on public.households
for insert
with check (owner_user_id = auth.uid());

drop policy if exists households_update on public.households;
create policy households_update on public.households
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

-- ============================================================================
-- 7. household_members
-- ============================================================================

drop policy if exists household_members_select on public.household_members;
create policy household_members_select on public.household_members
for select
using (
  user_id = auth.uid()
  or public.is_household_member(household_id)
);

-- Two legitimate ways to insert yourself as a member:
--   (a) bootstrap: you just created this household, so you become its owner
--   (b) accept an invite: your auth email matches a pending invite for this
--       household/role
drop policy if exists household_members_insert on public.household_members;
create policy household_members_insert on public.household_members
for insert
with check (
  user_id = auth.uid()
  and (
    (
      role = 'owner'
      and exists (
        select 1 from public.households h
        where h.id = household_members.household_id
          and h.owner_user_id = auth.uid()
      )
    )
    or exists (
      select 1 from public.household_invites i
      where i.household_id = household_members.household_id
        and i.role = household_members.role
        and i.status = 'pending'
        and lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
);

-- Leave a household yourself, or be removed by its owner. Nothing in the app
-- updates roles after the fact, so there's deliberately no UPDATE policy.
drop policy if exists household_members_delete on public.household_members;
create policy household_members_delete on public.household_members
for delete
using (
  user_id = auth.uid()
  or public.household_role(household_id) = 'owner'
);

-- ============================================================================
-- 8. household_invites
-- ============================================================================

drop policy if exists household_invites_select on public.household_invites;
create policy household_invites_select on public.household_invites
for select
using (
  public.is_household_member(household_id)
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists household_invites_insert on public.household_invites;
create policy household_invites_insert on public.household_invites
for insert
with check (
  invited_by = auth.uid()
  and public.can_manage_household(household_id)
);

-- Accept/decline: only the invited person, only while still pending.
drop policy if exists household_invites_update on public.household_invites;
create policy household_invites_update on public.household_invites
for update
using (
  status = 'pending'
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status in ('accepted', 'declined')
);

-- Cancel a pending invite you sent, or as household owner/parent.
drop policy if exists household_invites_delete on public.household_invites;
create policy household_invites_delete on public.household_invites
for delete
using (
  invited_by = auth.uid()
  or public.can_manage_household(household_id)
);

-- ============================================================================
-- 9. babies
-- ============================================================================

drop policy if exists babies_select on public.babies;
create policy babies_select on public.babies
for select
using (public.is_household_member(household_id));

drop policy if exists babies_insert on public.babies;
create policy babies_insert on public.babies
for insert
with check (public.can_write_household(household_id));

drop policy if exists babies_update on public.babies;
create policy babies_update on public.babies
for update
using (public.can_write_household(household_id))
with check (public.can_write_household(household_id));

-- ============================================================================
-- 10. Log tables + milestones + photos — identical shape, all keyed by baby_id
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'feeding_logs', 'sleep_logs', 'nappy_logs', 'tummy_time_logs',
    'medicine_logs', 'temperature_logs', 'growth_logs', 'milestones', 'photos'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format($f$
      create policy %I on public.%I
      for select
      using (public.is_household_member(public.household_id_for_baby(baby_id)))
    $f$, t || '_select', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format($f$
      create policy %I on public.%I
      for insert
      with check (
        created_by = auth.uid()
        and public.can_write_household(public.household_id_for_baby(baby_id))
      )
    $f$, t || '_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format($f$
      create policy %I on public.%I
      for update
      using (public.can_write_household(public.household_id_for_baby(baby_id)))
      with check (public.can_write_household(public.household_id_for_baby(baby_id)))
    $f$, t || '_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format($f$
      create policy %I on public.%I
      for delete
      using (public.can_write_household(public.household_id_for_baby(baby_id)))
    $f$, t || '_delete', t);
  end loop;
end $$;

-- ============================================================================
-- 11. Storage: photos bucket
-- ============================================================================
-- The bucket is public=true (see phase3_milestones_photos_sharing.sql), so
-- reads via getPublicUrl already bypass RLS entirely — that's unchanged by
-- this migration and is still a "switch to a private bucket + signed URLs
-- before shipping to real users" item for later. What RLS *can* still lock
-- down is the storage API itself (upload/remove), scoped by the baby_id
-- folder each object lives under (uploadPhoto writes to `${baby.id}/...`).

drop policy if exists photos_bucket_insert on storage.objects;
create policy photos_bucket_insert on storage.objects
for insert
with check (
  bucket_id = 'photos'
  and public.can_write_household(
    public.household_id_for_baby(nullif(split_part(name, '/', 1), '')::uuid)
  )
);

drop policy if exists photos_bucket_delete on storage.objects;
create policy photos_bucket_delete on storage.objects
for delete
using (
  bucket_id = 'photos'
  and public.can_write_household(
    public.household_id_for_baby(nullif(split_part(name, '/', 1), '')::uuid)
  )
);
