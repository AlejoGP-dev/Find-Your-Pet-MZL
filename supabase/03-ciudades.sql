-- Find Your Pet CO — paso a varias ciudades
-- Ejecutar completo en Supabase → SQL Editor. Es seguro repetirlo.
-- No usa unaccent para no depender de extensiones: compara las dos escrituras.

-- ─────────────────────────────────────────────────────────────
-- 1. Columna nueva
-- ─────────────────────────────────────────────────────────────
alter table public.reportes
  add column if not exists ciudad text not null default 'Manizales';

-- ─────────────────────────────────────────────────────────────
-- 2. Backfill de los reportes que ya existen
--    (111 reportes: 16 de Villamaría, 1 de Pereira, el resto Manizales)
-- ─────────────────────────────────────────────────────────────
update public.reportes
set ciudad = 'Villamaría'
where lower(barrio) like '%villamaria%'
   or lower(barrio) like '%villamaría%'
   or lower(barrio) like '%villa maria%'
   or lower(barrio) like '%villa maría%';

update public.reportes
set ciudad = 'Pereira'
where lower(barrio) like '%pereira%';

-- ─────────────────────────────────────────────────────────────
-- 3. Limpiar el barrio: ya no necesita cargar el nombre del municipio
-- ─────────────────────────────────────────────────────────────
update public.reportes
set barrio = btrim(replace(barrio, '(Villamaría)', ''))
where barrio like '%(Villamaría)%';

update public.reportes set barrio = 'El Estrelladero'
where lower(barrio) like '%estrelladero%';

update public.reportes set barrio = 'Sector Calamar'
where lower(barrio) like 'sector calamar%';

update public.reportes set barrio = 'Villa Esperanza'
where lower(barrio) like 'villa esperanza%';

update public.reportes set barrio = 'La Floresta'
where lower(barrio) like 'villa mar%floresta%';

update public.reportes set barrio = 'Centro'
where ciudad = 'Villamaría'
  and lower(barrio) in ('villamaria', 'villamaría', 'parque de villa maria', 'parque de villa maría');

update public.reportes set barrio = 'Primero de Febrero'
where lower(barrio) like 'primero de febrero%pereira%';

-- ─────────────────────────────────────────────────────────────
-- 4. Índice para que filtrar por ciudad sea instantáneo
-- ─────────────────────────────────────────────────────────────
create index if not exists reportes_ciudad_estado_idx
  on public.reportes (ciudad, estado, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 5. Comprobación: debe dar Manizales 94, Villamaría 16, Pereira 1
-- ─────────────────────────────────────────────────────────────
select ciudad, count(*) as reportes
from public.reportes
group by ciudad
order by reportes desc;
