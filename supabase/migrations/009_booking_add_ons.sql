-- Optional extra services selected during booking.
alter table public.bookings
  add column if not exists add_ons text[] not null default '{}';

comment on column public.bookings.add_ons is 'Selected optional extras at booking time (enum-like text values).';
