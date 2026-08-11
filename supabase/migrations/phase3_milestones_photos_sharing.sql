-- Phase 3: Milestones, Photos, and Caregiver Sharing
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- RLS is left disabled to match every other table in this project (dev setup).

-- 1. Milestones
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null,
  is_custom boolean not null default true,
  achieved boolean not null default true,
  achieved_at timestamptz,
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.milestones disable row level security;

create index if not exists milestones_baby_id_idx on public.milestones(baby_id);

-- 2. Photos
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  photo_url text not null,
  thumbnail_url text,
  caption text,
  category text check (category in ('everyday', 'milestone', 'growth', 'other')) default 'everyday',
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.photos disable row level security;

create index if not exists photos_baby_id_idx on public.photos(baby_id);

-- 3. Household invites (for Caregiver Sharing)
create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  invited_by uuid not null references public.profiles(id),
  email text not null,
  role text not null check (role in ('parent', 'caregiver', 'viewer')) default 'caregiver',
  status text not null check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

alter table public.household_invites disable row level security;

create index if not exists household_invites_email_idx on public.household_invites(email);
create index if not exists household_invites_household_id_idx on public.household_invites(household_id);

-- 4. Storage bucket for photos
-- The Storage API needs the service role key to create buckets, so this must be
-- done once by hand in the dashboard: Storage > New bucket
--   name: photos
--   public: true
-- (Public is simplest for a dev project with RLS disabled everywhere else;
-- switch to signed URLs + a private bucket before shipping to real users.)
