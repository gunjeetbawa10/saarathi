-- Clerk user id on bookings (replaces Supabase Auth user_id).
-- Run in Supabase: SQL Editor → New query → Run (whole script).

-- 1) Column for Clerk ids
alter table public.bookings
  add column if not exists clerk_user_id text;

-- 2) Drop any FK from public.bookings to auth.users (constraint name is not always bookings_user_id_fkey)
do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'bookings'
      and c.contype = 'f'
      and pg_get_constraintdef(c.oid) like '%auth.users%'
  loop
    execute format('alter table public.bookings drop constraint %I', r.conname);
  end loop;
end $$;

drop index if exists bookings_user_id_idx;

-- 3) Remove legacy Supabase Auth column if present
alter table public.bookings drop column if exists user_id;

create index if not exists bookings_clerk_user_id_idx
  on public.bookings (clerk_user_id)
  where clerk_user_id is not null;

comment on column public.bookings.clerk_user_id is 'Clerk user id (user_...) when the customer was signed in; null for guest checkout.';
