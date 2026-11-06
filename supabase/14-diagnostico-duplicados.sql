-- BUG-005 — ¿Estos pares de reportes son de la misma persona?
--
-- SOLO LECTURA: no cambia nada y no muestra ningún número de WhatsApp. Compara el
-- número dentro de la consulta y devuelve solo si coincide (D-52).
--
-- Se comparan los últimos 10 dígitos, que es lo que mide un celular en Colombia:
-- así `+57 300...` y `300...` cuentan como la misma línea. `digitos_distintos`
-- dice en cuántas posiciones difieren: 0 es la misma línea, 1 o 2 puede ser un
-- error al escribirlo, y más es casi seguro otra línea.
--
-- El nombre, el barrio y la fecha también se comparan sin mostrarlos.
--
-- Tienen que salir 2 filas. Si sale menos, alguno de los reportes ya no existe.

with pares(par, inferior, superior) as (
  values
    ('Pasto', '1dfbe11a-727f-4c22-9cec-c3c9ea82d5d8'::uuid, '83592f33-eda0-419c-9b84-063746013d94'::uuid),
    ('Chía',  'a058c459-cb47-4809-bfff-12bf7ac1f029'::uuid, 'a9386ed9-7743-41fb-a8ce-10ce4cb46a60'::uuid)
),
datos as (
  select
    p.par,
    right(regexp_replace(a.contacto_whatsapp, '\D', '', 'g'), 10) as numero_a,
    right(regexp_replace(b.contacto_whatsapp, '\D', '', 'g'), 10) as numero_b,
    lower(trim(a.contacto_nombre)) = lower(trim(b.contacto_nombre)) as mismo_nombre,
    lower(trim(a.barrio)) = lower(trim(b.barrio)) as mismo_barrio,
    a.fecha = b.fecha as misma_fecha,
    a.especie = b.especie as misma_especie,
    a.tipo = b.tipo as mismo_tipo,
    round(extract(epoch from (b.created_at - a.created_at)) / 60) as minutos_entre_ambos
  from pares p
  join public.reportes a on a.id = p.inferior
  join public.reportes b on b.id = p.superior
)
select
  par,
  numero_a = numero_b as mismos_10_digitos,
  (
    select count(*)
    from generate_series(1, 10) as i
    where substr(numero_a, i, 1) is distinct from substr(numero_b, i, 1)
  ) as digitos_distintos,
  mismo_nombre,
  mismo_barrio,
  misma_fecha,
  misma_especie,
  mismo_tipo,
  minutos_entre_ambos
from datos
order by par;
