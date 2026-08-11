-- =====================================================================
-- Find Your Pet MZL — esquema de base de datos
-- Pega TODO este archivo en Supabase → SQL Editor → Run
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.reportes (
  id                uuid primary key default gen_random_uuid(),
  tipo              text not null check (tipo in ('perdida', 'encontrada')),
  nombre            text,
  especie           text not null check (especie in ('perro', 'gato', 'otro')),
  raza              text,
  color             text,
  tamano            text check (tamano in ('pequeno', 'mediano', 'grande')),
  sexo              text check (sexo in ('macho', 'hembra', 'no_se')),
  foto_url          text,
  barrio            text not null,
  referencia        text,
  fecha             date not null,
  descripcion       text,
  contacto_nombre   text not null,
  contacto_whatsapp text not null,
  estado            text not null default 'activo' check (estado in ('activo', 'resuelto')),
  token_gestion     text not null,
  created_at        timestamptz not null default now()
);

create index if not exists reportes_orden_idx  on public.reportes (created_at desc);
create index if not exists reportes_estado_idx on public.reportes (estado, tipo);
create index if not exists reportes_barrio_idx on public.reportes (barrio);

-- La app entra siempre con la llave de servicio desde el servidor de Next.js,
-- así que dejamos RLS activo y sin políticas públicas: nadie puede leer ni
-- escribir directo desde el navegador.
alter table public.reportes enable row level security;

-- Permisos explícitos para el rol de servicio (necesarios si dejaste apagada
-- la opción "Automatically expose new tables" al crear el proyecto).
grant usage on schema public to service_role;
grant all privileges on table public.reportes to service_role;

-- Y nos aseguramos de que anon/authenticated NO puedan tocar la tabla directo.
revoke all on table public.reportes from anon, authenticated;

-- ---------------------------------------------------------------------
-- Almacenamiento de fotos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do update set public = true;
