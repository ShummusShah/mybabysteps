-- Make the photos bucket private + add the missing SELECT policy.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
--
-- Until now the `photos` bucket was public=true, so anyone with a photo's
-- URL could view it with no auth at all — see harden_rls_and_missing_tables.sql
-- section 11. The app now stores just the storage path in photo_url/
-- avatar_url and resolves a short-lived signed URL on demand (useSignedUrl),
-- so this can be flipped to private without breaking anything.
--
-- Generating a signed URL still requires SELECT permission via RLS, which
-- this bucket never had (only insert/delete existed, because public=true
-- bypassed RLS on read). This adds that policy. Unlike insert/delete
-- (can_write_household — owner/parent/caregiver only), SELECT uses
-- is_household_member so 'viewer' can still see photos, matching "'viewer'
-- is read-only everywhere" from harden_rls_and_missing_tables.sql.

update storage.buckets set public = false where id = 'photos';

drop policy if exists photos_bucket_select on storage.objects;
create policy photos_bucket_select on storage.objects
for select
using (
  bucket_id = 'photos'
  and public.is_household_member(
    public.household_id_for_baby(nullif(split_part(name, '/', 1), '')::uuid)
  )
);
