-- Single admin login row. Password is bcrypt; default username/password: admin / admin
-- To change the password later: generate a bcrypt hash (e.g. `node -e "console.log(require('bcryptjs').hashSync('YOUR_NEW_PASSWORD',10))"`)
-- then run: update public.admin_credentials set password_hash = '...', updated_at = now() where username = 'admin';

create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_credentials enable row level security;

-- Bcrypt hash for password "admin" (cost 10). Service role bypasses RLS for API use.
insert into public.admin_credentials (username, password_hash)
values (
  'admin',
  '$2b$10$ynVnnDXe/YqJ9Ow3rOnl.uHfyOliwNuz2xxlgvJzIOppB4kHcx/HC'
)
on conflict (username) do nothing;

comment on table public.admin_credentials is 'Admin panel login; read by API with service role only.';
