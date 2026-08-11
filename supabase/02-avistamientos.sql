-- =====================================================================
-- Find Your Pet MZL — avistamientos ("la vi en tal lugar")
-- Pega TODO este archivo en Supabase → SQL Editor → Run
-- Es seguro correrlo varias veces.
-- =====================================================================

create table if not exists public.avistamientos (
  id          uuid primary key default gen_random_uuid(),
  reporte_id  uuid not null references public.reportes(id) on delete cascade,
  lugar       text not null,
  fecha       date not null,
  comentario  text,
  nombre      text,
  whatsapp    text,
  created_at  timestamptz not null default now()
);

create index if not exists avistamientos_reporte_idx
  on public.avistamientos (reporte_id, created_at desc);

alter table public.avistamientos enable row level security;

grant usage on schema public to service_role;
grant all privileges on table public.avistamientos to service_role;
revoke all on table public.avistamientos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Contador en el reporte, para mostrar "3 pistas" en las tarjetas
-- sin tener que consultar la tabla completa.
-- ---------------------------------------------------------------------
alter table public.reportes
  add column if not exists avistamientos integer not null default 0;

create or replace function public.recalcular_avistamientos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.reportes
       set avistamientos = avistamientos + 1
     where id = new.reporte_id;
  elsif tg_op = 'DELETE' then
    update public.reportes
       set avistamientos = greatest(avistamientos - 1, 0)
     where id = old.reporte_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_avistamientos on public.avistamientos;
create trigger trg_avistamientos
  after insert or delete on public.avistamientos
  for each row execute function public.recalcular_avistamientos();

-- Sincroniza el contador con lo que ya exista.
update public.reportes r
   set avistamientos = (
     select count(*) from public.avistamientos a where a.reporte_id = r.id
   );
