-- Add measurement_location to temperature_logs
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

alter table public.temperature_logs
  add column if not exists measurement_location text;
