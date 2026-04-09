-- Service location postcode (validated against coverage in the API).
alter table public.bookings
  add column if not exists postcode text;

comment on column public.bookings.postcode is 'UK outward+inward postcode at booking time (normalized).';
