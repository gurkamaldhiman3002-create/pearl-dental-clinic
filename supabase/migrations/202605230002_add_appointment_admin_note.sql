alter table public.appointments
  add column if not exists admin_note text;
