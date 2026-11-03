-- Upgrade an existing SILIP database from SMS verification to email verification.
-- Run this entire file in Supabase SQL Editor. Existing profiles and stamps are retained.
begin;

-- Consult authoritative Auth data so clients cannot claim that an email is verified.
create or replace function public.has_verified_email()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from auth.users u
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
      and coalesce(u.email, '') <> '' and not coalesce(u.is_anonymous, false));
$$;
revoke all on function public.has_verified_email() from public, anon;
grant execute on function public.has_verified_email() to authenticated;
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "create own verified profile" on public.profiles;
drop policy if exists "update own verified profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.has_verified_email()));
create policy "create own verified profile" on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.has_verified_email()));
create policy "update own verified profile" on public.profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.has_verified_email()))
  with check (user_id = (select auth.uid()) and (select public.has_verified_email()));
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Old phone-only policies were replaced above, so this helper is no longer needed.
drop function if exists public.has_verified_phone();
commit;
