-- Contact form + newsletter signups for the admin dashboard.
-- Run in Supabase SQL Editor after prior migrations.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_signups_created_at_idx
  on public.newsletter_signups (created_at desc);

alter table public.newsletter_signups enable row level security;

comment on table public.contact_submissions is 'Website contact form; written by API route (service role).';
comment on table public.newsletter_signups is 'Newsletter emails; written by API route (service role).';
