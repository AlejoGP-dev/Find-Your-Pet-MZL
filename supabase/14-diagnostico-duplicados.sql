-- BUG-005 — ¿Estos pares de reportes son de la misma persona?
--
-- SOLO LECTURA: no cambia nada y no muestra ningún número de WhatsApp. Compara el
-- número dentro de la consulta y devuelve solo si coincide (D-52).
--
-- Se compara de dos formas: tal como está guardado, y dejando solo los dígitos,
-- por si uno se escribió con espacios o con +57. Si `mismo_exacto` es falso y
-- `mismo_digitos` es verdadero, es la misma línea escrita distinto.
--
-- Tienen que salir 2 filas. Si sale menos, alguno de los reportes ya no existe.

with pares(par, inferior, superior) as (
  values
    ('Pasto', '1dfbe11a-727f-4c22-9cec-c3c9ea82d5d8'::uuid, '83592f33-eda0-419c-9b84-063746013d94'::uuid),
    ('Chía',  'a058c459-cb47-4809-bfff-12bf7ac1f029'::uuid, 'a9386ed9-7743-41fb-a8ce-10ce4cb46a60'::uuid)
)
select
  p.par,
  a.contacto_whatsapp = b.contacto_whatsapp as mismo_exacto,
  regexp_replace(a.contacto_whatsapp, '\D', '', 'g')
    = regexp_replace(b.contacto_whatsapp, '\D', '', 'g') as mismo_digitos,
  a.especie = b.especie as misma_especie,
  a.tipo = b.tipo as mismo_tipo,
  a.estado as estado_inferior,
  b.estado as estado_superior,
  a.foto_url is not null as inferior_con_foto,
  b.foto_url is not null as superior_con_foto,
  round(extract(epoch from (b.created_at - a.created_at)) / 60) as minutos_entre_ambos
from pares p
join public.reportes a on a.id = p.inferior
join public.reportes b on b.id = p.superior
order by p.par;
