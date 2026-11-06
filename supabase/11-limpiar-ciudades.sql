-- BUG-002 — Reportes con el campo «ciudad» mal diligenciado.
--
-- Corrige 3 reportes cuyo municipio se conoce y elimina 2 sin municipio
-- identificable (decisión de Alejo, 6 de noviembre de 2026).
--
-- Este repositorio es público: acá van solo los id, nunca lo que escribió la
-- persona. Por eso el control usa el largo del texto y no el texto.
--
-- Se ejecuta completo en el SQL Editor de Supabase. Es atómico: si alguno de
-- los reportes no está como se espera, lanza un error y NO cambia nada.
-- Volver a correrlo después de un éxito también da error, sin cambiar nada.
--
-- Las coordenadas son el centro del municipio, las mismas de
-- `src/lib/coordenadas.ts`, con precisión 'ciudad'. Sin ellas estos reportes no
-- entran al cruce entre perdidas y encontradas.
--
-- Eliminar es irreversible. `avistamientos` se borra en cascada (hoy, 0 filas).
-- La foto NO se borra con esto: se elimina aparte, desde Storage.

do $$
declare
  n integer;
begin
  update public.reportes
     set ciudad = 'Bogotá', lat = 4.711, lng = -74.0721, ubicacion_precision = 'ciudad'
   where id = '79cb3776-ff5e-44c2-8538-4d71387c5c1d' and length(ciudad) = 43;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BUG-002: 79cb3776 no está como se esperaba'; end if;

  update public.reportes
     set ciudad = 'Villamaría', lat = 5.0447, lng = -75.5122, ubicacion_precision = 'ciudad'
   where id = '81b6a3bd-29a3-4aa6-b9d0-f655de70f9ea' and length(ciudad) = 41;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BUG-002: 81b6a3bd no está como se esperaba'; end if;

  update public.reportes
     set ciudad = 'Jamundí', lat = 3.2611, lng = -76.5397, ubicacion_precision = 'ciudad'
   where id = '8349d085-0174-4ffe-b774-a3783bea38f9' and length(ciudad) = 13;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BUG-002: 8349d085 no está como se esperaba'; end if;

  delete from public.reportes
   where id = 'ad71d53e-1d05-4361-93da-b3ef9fe90eca' and length(ciudad) = 60;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BUG-002: ad71d53e no está como se esperaba'; end if;

  delete from public.reportes
   where id = '4f38aed2-dde3-430c-af46-1447234c5dfd' and length(ciudad) = 7;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'BUG-002: 4f38aed2 no está como se esperaba'; end if;
end $$;

-- Comprobación: tienen que salir 3 filas, con la ciudad nueva y sus coordenadas.
select left(id::text, 8) as reporte, ciudad, lat, lng, ubicacion_precision
from public.reportes
where id in (
  '79cb3776-ff5e-44c2-8538-4d71387c5c1d',
  '81b6a3bd-29a3-4aa6-b9d0-f655de70f9ea',
  '8349d085-0174-4ffe-b774-a3783bea38f9',
  'ad71d53e-1d05-4361-93da-b3ef9fe90eca',
  '4f38aed2-dde3-430c-af46-1447234c5dfd'
)
order by ciudad;
