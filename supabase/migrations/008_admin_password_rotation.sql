-- Rotate admin password hash.
-- Username remains: admin

update public.admin_credentials
set
  password_hash = '$2b$10$qE1PR90gD0e3sioy/I7KkeYmBrsEqmA.qZeUni0aAZRpAmCWGWVyu',
  updated_at = now()
where username = 'admin';
