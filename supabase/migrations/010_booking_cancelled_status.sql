-- Allow booking cancellation status in payment_status constraint.
alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'cancelled'));
