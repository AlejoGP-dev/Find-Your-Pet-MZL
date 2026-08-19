-- UNA sola consulta, de solo lectura.
-- (El editor de Supabase muestra únicamente el resultado del último statement,
--  por eso esta vez va una sola.)
--
-- Muestra el valor EXACTO de la columna tipo, entre corchetes y con su largo,
-- para que se vea si trae un espacio de más, una mayúscula o un acento.

select
  '[' || tipo || ']'  as tipo_exacto,
  length(tipo)        as largo,
  estado,
  count(*)            as reportes
from public.reportes
group by 1, 2, 3
order by 1, 3;
