-- =====================================================================
-- Find Your Pet CO — adopciones
-- Pega TODO este archivo en Supabase → SQL Editor → Run
-- Es seguro correrlo varias veces.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.adopciones (
  id                uuid primary key default gen_random_uuid(),
  nombre            text,
  especie           text not null check (especie in ('perro', 'gato')),
  raza              text,
  color             text,
  tamano            text check (tamano in ('pequeno', 'mediano', 'grande')),
  sexo              text check (sexo in ('macho', 'hembra', 'no_se')),
  edad              text check (edad in ('cachorro', 'joven', 'adulto', 'mayor')),
  foto_url          text,

  -- Salud. "no_se" es una respuesta válida a propósito: quien rescató de la
  -- calle muchas veces no sabe, y obligarlo a mentir es peor.
  esterilizado      text check (esterilizado in ('si', 'no', 'no_se')),
  vacunas           text check (vacunas in ('al_dia', 'parciales', 'no_se')),
  desparasitado     text check (desparasitado in ('si', 'no', 'no_se')),

  -- Con quién puede convivir: arreglo de 'ninos', 'perros', 'gatos'.
  convive_con       text[] not null default '{}',
  temperamento      text,
  motivo            text,
  entrego_con       text,

  ciudad            text not null,
  barrio            text not null,
  descripcion       text,

  contacto_nombre   text not null,
  contacto_whatsapp text not null,
  -- Fundación o albergue con proceso propio. Se marca a mano por ahora.
  es_fundacion      boolean not null default false,

  estado            text not null default 'disponible'
                    check (estado in ('disponible', 'reservado', 'adoptado')),
  token_gestion     text not null,
  created_at        timestamptz not null default now()
);

create index if not exists adopciones_orden_idx
  on public.adopciones (created_at desc);
create index if not exists adopciones_ciudad_idx
  on public.adopciones (ciudad, estado, created_at desc);
create index if not exists adopciones_estado_idx
  on public.adopciones (estado, especie);

-- Mismo criterio que en reportes: la app entra siempre con la llave de
-- servicio desde el servidor, así que RLS activo y sin políticas públicas.
alter table public.adopciones enable row level security;

grant usage on schema public to service_role;
grant all privileges on table public.adopciones to service_role;
revoke all on table public.adopciones from anon, authenticated;

-- ---------------------------------------------------------------------
-- Comprobación
-- ---------------------------------------------------------------------
select count(*) as adopciones_publicadas from public.adopciones;
