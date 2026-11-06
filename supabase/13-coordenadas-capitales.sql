-- H-64 — Reportes sin coordenadas por una diferencia de nombre.
--
-- La tabla de `src/lib/coordenadas.ts` tenía Cartagena y Cúcuta con su nombre
-- corto, pero se guardan como `Cartagena de Indias` y `San José de Cúcuta`, así
-- que estos reportes se publicaron sin coordenadas. Quedaban fuera del filtro
-- «cerca de mí». Buga y Tumaco tenían el mismo problema, sin reportes hoy.
--
-- Este archivo solo agrega el centro del municipio, con precisión 'ciudad'.
-- No toca ningún otro campo. Se ejecuta completo en el SQL Editor de Supabase.
-- Es atómico: si un reporte no está como se espera, da error y NO cambia nada.

do $$
declare
  n integer;
begin
  update public.reportes
     set lat = 10.391, lng = -75.4794, ubicacion_precision = 'ciudad'
   where id = 'f1508b7b-349f-41a4-a807-de33c61a7fbe'
     and ciudad = 'Cartagena de Indias'
     and lat is null;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'H-64: f1508b7b no está como se esperaba'; end if;

  update public.reportes
     set lat = 7.8939, lng = -72.5078, ubicacion_precision = 'ciudad'
   where id = '39f09e6c-a7e5-4470-b287-7a37b3eda5a7'
     and ciudad = 'San José de Cúcuta'
     and lat is null;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'H-64: 39f09e6c no está como se esperaba'; end if;
end $$;

-- Comprobación: tienen que salir 2 filas, con sus coordenadas y precisión 'ciudad'.
select left(id::text, 8) as reporte, ciudad, lat, lng, ubicacion_precision
from public.reportes
where id in (
  'f1508b7b-349f-41a4-a807-de33c61a7fbe',
  '39f09e6c-a7e5-4470-b287-7a37b3eda5a7'
)
order by ciudad;
