-- WPO-003 — Guardar el tamaño real de la foto
--
-- Para que la ficha reserve el espacio exacto de cada foto antes de que
-- cargue. Sin esto hay que fijar una proporción única para todas (hoy 3:4) y
-- las fotos horizontales quedan con franjas grises.
--
-- Es una migración ADITIVA: dos columnas nulables. No toca ni una fila
-- existente, no cambia índices y no puede romper nada de lo que ya funciona.
-- Los reportes que ya están publicados se quedan con las columnas en NULL y
-- siguen usando la proporción 3:4 de respaldo.
--
-- Ejecutar en el SQL Editor de Supabase ANTES de desplegar el código.

alter table public.reportes
  add column if not exists foto_ancho  integer,
  add column if not exists foto_alto   integer;

alter table public.adopciones
  add column if not exists foto_ancho  integer,
  add column if not exists foto_alto   integer;

-- Guardarraíl: valores absurdos (0, negativos o de más de 20.000 px) harían
-- que el navegador reserve una caja imposible. Mejor rechazarlos en la base
-- que descubrirlo en la pantalla de alguien.
alter table public.reportes
  drop constraint if exists reportes_foto_medidas_ok;
alter table public.reportes
  add constraint reportes_foto_medidas_ok check (
    (foto_ancho is null and foto_alto is null)
    or (foto_ancho between 1 and 20000 and foto_alto between 1 and 20000)
  );

alter table public.adopciones
  drop constraint if exists adopciones_foto_medidas_ok;
alter table public.adopciones
  add constraint adopciones_foto_medidas_ok check (
    (foto_ancho is null and foto_alto is null)
    or (foto_ancho between 1 and 20000 and foto_alto between 1 and 20000)
  );

comment on column public.reportes.foto_ancho is
  'Ancho en píxeles de la foto ya comprimida. Lo manda el navegador al publicar. Sirve para reservar el espacio y evitar el salto de layout (WPO-003).';
comment on column public.reportes.foto_alto is
  'Alto en píxeles de la foto ya comprimida. Ver foto_ancho.';
