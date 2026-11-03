-- Email/password accounts without email or SMS verification.
-- FIRST turn OFF Confirm email in Authentication > Sign In / Providers and Save.
-- Run this entire file in SQL Editor. Existing profiles and stamps are retained.
begin;

create or replace function public.has_account()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from auth.users u
    where u.id = (select auth.uid()) and coalesce(u.email, '') <> ''
      and not coalesce(u.is_anonymous, false));
$$;
revoke all on function public.has_account() from public, anon;
grant execute on function public.has_account() to authenticated;
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "create own verified profile" on public.profiles;
drop policy if exists "update own verified profile" on public.profiles;
drop policy if exists "create own account profile" on public.profiles;
drop policy if exists "update own account profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.has_account()));
create policy "create own account profile" on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.has_account()));
create policy "update own account profile" on public.profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.has_account()))
  with check (user_id = (select auth.uid()) and (select public.has_account()));
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
drop function if exists public.has_verified_phone();
drop function if exists public.has_verified_email();
commit;
