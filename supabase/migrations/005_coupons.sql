-- Discount coupons for bookings. Apply migration in Supabase SQL Editor.

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_percent int,
  discount_amount_pence int,
  max_uses int,
  uses_count int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_code_unique unique (code),
  constraint coupons_percent_check check (
    discount_type <> 'percent' or (discount_percent is not null and discount_percent > 0 and discount_percent <= 100)
  ),
  constraint coupons_fixed_check check (
    discount_type <> 'fixed' or (discount_amount_pence is not null and discount_amount_pence > 0)
  )
);

create index if not exists coupons_code_lower_idx on public.coupons (lower(code));

alter table public.coupons enable row level security;

comment on table public.coupons is 'Managed via Next.js admin; API uses service role.';

alter table public.bookings
  add column if not exists subtotal_pence int,
  add column if not exists discount_pence int not null default 0,
  add column if not exists coupon_id uuid references public.coupons (id) on delete set null,
  add column if not exists coupon_code text;

update public.bookings
set subtotal_pence = price
where subtotal_pence is null;

create or replace function public.increment_coupon_use(coupon_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.coupons
  set uses_count = uses_count + 1
  where id = coupon_uuid;
end;
$$;
