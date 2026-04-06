-- Run in Supabase: SQL Editor → New query → paste → Run
-- Or: supabase db push (if you use Supabase CLI linked to this project)

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service text not null
    check (service in ('DEEP_CLEAN', 'AIRBNB', 'STANDARD', 'OFFICE')),
  property_size text not null
    check (property_size in ('ONE_BED', 'TWO_BED', 'THREE_BED', 'FOUR_PLUS')),
  date timestamptz not null,
  time text not null,
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  notes text,
  price integer not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

-- If the table was created earlier without user_id, add it BEFORE any index on user_id.
alter table public.bookings
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

-- Server uses service role only; block public anon/auth from reading/writing.
alter table public.bookings enable row level security;

comment on table public.bookings is 'Cleaning bookings; accessed via service role from Next.js API routes only.';
