-- =====================================================================
-- SILIP · Digital Heritage Passport — Supabase schema
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- Requires: Confirm email OFF; Authentication → Providers → "Allow anonymous sign-ins" ON
-- =====================================================================

-- ---------- Tables ----------
create table if not exists public.sites (
  id    text primary key,
  name  text not null,
  est   int,
  sort  int not null default 0
);

-- One secret code per site. It is printed inside that site's QR code.
-- Visitors can never read this table; only collect_stamp() and admin functions can.
create table if not exists public.site_secrets (
  site_id    text primary key references public.sites(id) on delete cascade,
  token      text not null default replace(gen_random_uuid()::text, '-', ''),
  rotated_at timestamptz not null default now()
);

create table if not exists public.stamps (
  user_id      uuid not null references auth.users(id) on delete cascade,
  site_id      text not null references public.sites(id) on delete cascade,
  collected_at timestamptz not null default now(),
  primary key (user_id, site_id)
);
create index if not exists stamps_site_idx on public.stamps (site_id);
create index if not exists stamps_time_idx on public.stamps (collected_at);

-- Every scan attempt (good or bad), for rate limiting and analytics.
create table if not exists public.scan_log (
  id      bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  site_id text,
  ok      boolean not null,
  at      timestamptz not null default now()
);
create index if not exists scan_log_user_idx on public.scan_log (user_id, at desc);
create index if not exists scan_log_at_idx   on public.scan_log (at);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Email addresses and passwords belong to Supabase Auth, not editable profile rows.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  age integer check (age between 1 and 120),
  photo text not null default '' check (length(photo) <= 300000),
  issued_at timestamptz not null default now()
);

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

-- ---------- Seed the four heritage sites ----------
insert into public.sites (id, name, est, sort) values
  ('barasoain', 'Barasoain Church', 1859, 1),
  ('casa-real', 'Casa Real', 1860, 2),
  ('cathedral', 'Malolos Cathedral', 1857, 3),
  ('bahay', 'Bahay ng mga Kababaihan ng Malolos', 1985, 4)
on conflict (id) do nothing;

insert into public.site_secrets (site_id)
select id from public.sites
on conflict (site_id) do nothing;

-- ---------- Row Level Security ----------
alter table public.sites        enable row level security;
alter table public.site_secrets enable row level security;
alter table public.stamps       enable row level security;
alter table public.scan_log     enable row level security;
alter table public.admins       enable row level security;

drop policy if exists "sites are public"   on public.sites;
create policy "sites are public" on public.sites
  for select to anon, authenticated using (true);

drop policy if exists "read own stamps" on public.stamps;
create policy "read own stamps" on public.stamps
  for select to authenticated using (user_id = (select auth.uid()));

-- No insert/update/delete policies exist: the only way to add a stamp is collect_stamp().
-- site_secrets, scan_log and admins have no policies at all: clients cannot touch them.

revoke all on public.site_secrets, public.scan_log, public.admins from anon, authenticated;
revoke insert, update, delete on public.sites, public.stamps from anon, authenticated;
grant select on public.sites to anon, authenticated;
grant select on public.stamps to authenticated;

-- ---------- Functions ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- Visitor: claim a stamp by presenting the site's code from its QR.
-- Returns {ok:true, new:bool, collected_at} or {ok:false, error:'invalid_code'|'rate_limited'|'not_signed_in'}
create or replace function public.collect_stamp(p_site text, p_token text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  uid      uuid := (select auth.uid());
  good     boolean;
  fails    int;
  added    int;
  got_at   timestamptz;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  -- Rate limit: 20 bad codes per 10 minutes per visitor.
  select count(*) into fails from public.scan_log l
   where l.user_id = uid and not l.ok and l.at > now() - interval '10 minutes';
  if fails >= 20 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  select exists (
    select 1 from public.site_secrets s where s.site_id = p_site and s.token = p_token
  ) into good;

  insert into public.scan_log (user_id, site_id, ok)
  values (uid, left(coalesce(p_site, ''), 64), good);

  if not good then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  insert into public.stamps (user_id, site_id) values (uid, p_site)
  on conflict do nothing;
  get diagnostics added = row_count;

  select st.collected_at into got_at from public.stamps st
   where st.user_id = uid and st.site_id = p_site;

  return jsonb_build_object('ok', true, 'new', added > 0, 'collected_at', got_at);
end;
$$;

-- Admin: current code for every site (used to print QR codes).
create or replace function public.admin_get_tokens()
returns table (id text, name text, token text)
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select s.id, s.name, k.token
      from public.sites s join public.site_secrets k on k.site_id = s.id
     order by s.sort;
end;
$$;

-- Admin: invalidate a site's printed QR code and issue a new code.
create or replace function public.admin_rotate_token(p_site text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare fresh text := replace(gen_random_uuid()::text, '-', '');
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.site_secrets set token = fresh, rotated_at = now() where site_id = p_site;
  if not found then raise exception 'unknown site' using errcode = 'P0002'; end if;
  return fresh;
end;
$$;

-- Admin: dashboard numbers (days are Philippine time).
create or replace function public.admin_stats()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  n_sites int;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select count(*) into n_sites from public.sites;

  return jsonb_build_object(
    'generated_at', now(),
    'visitors',     (select count(distinct l.user_id) from public.scan_log l),
    'collectors',   (select count(distinct st.user_id) from public.stamps st),
    'stamps',       (select count(*) from public.stamps),
    'completed',    (select count(*) from (
                       select st.user_id from public.stamps st group by st.user_id having count(*) >= n_sites) c),
    'failed_scans', (select count(*) from public.scan_log l where not l.ok),
    'by_site',      coalesce((
        select jsonb_agg(jsonb_build_object(
                 'site_id', s.id, 'name', s.name,
                 'stamps', coalesce(a.n, 0), 'scans', coalesce(b.n, 0)) order by s.sort)
          from public.sites s
          left join (select site_id, count(*) n from public.stamps group by site_id) a on a.site_id = s.id
          left join (select site_id, count(*) n from public.scan_log where ok group by site_id) b on b.site_id = s.id
      ), '[]'::jsonb),
    'daily',        coalesce((
        select jsonb_agg(jsonb_build_object('day', to_char(x.d, 'YYYY-MM-DD'), 'scans', x.n) order by x.d)
          from (select (l.at at time zone 'Asia/Manila')::date as d, count(*) as n
                  from public.scan_log l
                 where l.ok and l.at > now() - interval '30 days'
                 group by 1) x
      ), '[]'::jsonb)
  );
end;
$$;

-- Only signed-in (including anonymous) users may call these; the admin ones check is_admin() inside.
-- (Drop the old signatures first if you ran an earlier version of this file.)
drop function if exists public.admin_site_tokens();
drop function if exists public.admin_stats(int);
revoke execute on function public.is_admin(), public.collect_stamp(text, text),
  public.admin_get_tokens(), public.admin_rotate_token(text), public.admin_stats()
  from public, anon;
grant execute on function public.is_admin(), public.collect_stamp(text, text),
  public.admin_get_tokens(), public.admin_rotate_token(text), public.admin_stats()
  to authenticated;

-- ---------- Make yourself an admin ----------
-- 1. Open /admin.html on your site and sign in with your SILIP email and password.
-- 2. The page shows an "access denied" box containing a ready-made line like the one below.
--    Copy it into the SQL Editor and run it once:
--    insert into public.admins (user_id) values ('<your-user-id>');
