-- Find Your Pet CO — retoque después de la migración a ciudades.
-- Quedaron 2 reportes con el barrio "Corregimiento o vereda de Manizales",
-- que ya no existe en el catálogo (ahora la ciudad va aparte). Sin esto no
-- aparecen al filtrar por "Corregimiento o vereda".

update public.reportes
set barrio = 'Corregimiento o vereda'
where lower(barrio) like 'corregimiento o vereda de %';

-- Comprobación: debe devolver 0 filas.
select id, ciudad, barrio
from public.reportes
where lower(barrio) like 'corregimiento o vereda de %';
