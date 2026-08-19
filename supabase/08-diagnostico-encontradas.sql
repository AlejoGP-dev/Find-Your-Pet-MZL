-- Diagnóstico: ¿por qué el contador de «Encontradas» quedó en 0?
--
-- Todo acá es de SOLO LECTURA. No modifica ni una fila.
-- Correr en el SQL Editor de Supabase y pasarme el resultado.

-- ---------------------------------------------------------------------------
-- 1) El cuadro completo: cuántos reportes hay de cada tipo y estado.
--    Esta es la consulta que responde la pregunta.
-- ---------------------------------------------------------------------------
select tipo, estado, count(*) as reportes
from public.reportes
group by tipo, estado
order by tipo, estado;

-- ---------------------------------------------------------------------------
-- 2) Las 10 encontradas más recientes, con su estado y fecha.
--    Si aparecen como 'resuelto', alguien las marcó. Si no aparece ninguna,
--    es que ya no están en la tabla.
-- ---------------------------------------------------------------------------
select id, nombre, ciudad, estado, created_at
from public.reportes
where tipo = 'encontrada'
order by created_at desc
limit 10;

-- ---------------------------------------------------------------------------
-- 3) ¿Existen las columnas de la migración 06? (foto_ancho / foto_alto)
--    Si esto devuelve 0 filas, falta correr 06-medidas-foto.sql.
-- ---------------------------------------------------------------------------
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'reportes'
  and column_name in ('foto_ancho', 'foto_alto');

-- ---------------------------------------------------------------------------
-- 4) Total de filas y cuántas activas, para cuadrar con lo que muestra el sitio.
-- ---------------------------------------------------------------------------
select
  count(*)                                        as total,
  count(*) filter (where estado = 'activo')       as activos,
  count(*) filter (where estado = 'resuelto')     as resueltos
from public.reportes;
