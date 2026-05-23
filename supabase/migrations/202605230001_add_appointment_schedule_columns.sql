alter table public.appointments
  add column if not exists scheduled_start timestamptz,
  add column if not exists scheduled_end timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_schedule_valid_range'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_schedule_valid_range
      check (
        scheduled_start is null
        or scheduled_end is null
        or scheduled_end > scheduled_start
      );
  end if;
end
$$;

create index if not exists appointments_scheduled_start_idx
  on public.appointments (scheduled_start)
  where status in ('pending', 'approved');
