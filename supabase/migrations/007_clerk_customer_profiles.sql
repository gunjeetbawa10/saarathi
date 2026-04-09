-- Mirror Clerk users into Supabase so the admin Customers list can include signups
-- (webhook + optional account-page sync). Accessed only via service role from Next.js.

create table if not exists public.clerk_customer_profiles (
  clerk_user_id text primary key,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  updated_at timestamptz not null default now()
);

create index if not exists clerk_customer_profiles_email_lower_idx
  on public.clerk_customer_profiles (lower(email));

alter table public.clerk_customer_profiles enable row level security;

comment on table public.clerk_customer_profiles is 'Synced from Clerk (webhook + account page); admin directory merges by email.';
