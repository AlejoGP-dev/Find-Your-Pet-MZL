-- Normalizar los nombres de ciudad que ya están en la base
--
-- Contexto: hasta ahora la app solo reconocía 8 ciudades. Quien vivía en otra
-- escribía el nombre a mano, sin corrector, y por eso hoy conviven «Bogotá» y
-- «Bogota» como si fueran ciudades distintas — cada una con su propio filtro y
-- ninguna con página propia.
--
-- Desde el código nuevo, cada reporte se guarda con el nombre oficial del
-- municipio (DIVIPOLA del DANE). Este archivo arregla lo que ya estaba escrito.
--
-- Ejecutar en el SQL Editor DESPUÉS de desplegar el código.
-- No hay prisa: la app funciona igual antes y después, solo que las ciudades
-- mal escritas no aparecen agrupadas en los filtros hasta que esto corra.

-- ---------------------------------------------------------------------------
-- PASO 1 — Mirar qué hay, antes de tocar nada.
-- Correr esto solo y revisar el resultado antes de seguir.
-- ---------------------------------------------------------------------------
select ciudad, count(*) as reportes
from public.reportes
group by ciudad
order by reportes desc, ciudad;

-- ---------------------------------------------------------------------------
-- PASO 2 — Limpieza general (segura para cualquier valor)
-- ---------------------------------------------------------------------------

-- Espacios de sobra y espacios dobles.
update public.reportes
set ciudad = btrim(regexp_replace(ciudad, '\s+', ' ', 'g'))
where ciudad is distinct from btrim(regexp_replace(ciudad, '\s+', ' ', 'g'));

-- «Quimbaya, Quindío» → «Quimbaya». La gente pega el departamento detrás; el
-- departamento ya lo sabe la app por el municipio.
update public.reportes
set ciudad = btrim(split_part(ciudad, ',', 1))
where ciudad like '%,%' and btrim(split_part(ciudad, ',', 1)) <> '';

-- ---------------------------------------------------------------------------
-- PASO 3 — Nombres oficiales
--
-- La comparación ignora tildes y mayúsculas con translate(), no con unaccent:
-- esa extensión no está instalada y no vale la pena pedirla solo para esto.
-- ---------------------------------------------------------------------------
with oficiales(nombre) as (
  values
    ('Manizales'), ('Villamaría'), ('Pereira'), ('Dosquebradas'),
    ('Cali'), ('Quibdó'), ('Armenia'), ('Popayán'),
    ('Bogotá'), ('Medellín'), ('Barranquilla'), ('Cartagena'),
    ('Cúcuta'), ('Bucaramanga'), ('Ibagué'), ('Santa Marta'),
    ('Villavicencio'), ('Pasto'), ('Montería'), ('Neiva'),
    ('Palmira'), ('Buenaventura'), ('Floridablanca'), ('Sincelejo'),
    ('Valledupar'), ('Itagüí'), ('Envigado'), ('Tuluá'),
    ('Quimbaya'), ('Chinchiná'), ('La Dorada'), ('Riosucio'),
    ('Anserma'), ('Salamina'), ('Neira'), ('Palestina'),
    ('Marsella'), ('Santa Rosa de Cabal'), ('Calarcá'), ('Montenegro'),
    ('Circasia'), ('La Tebaida'), ('Cartago'), ('Soacha'),
    ('Bello'), ('Rionegro'), ('Apartadó'), ('Turbo'),
    ('Yopal'), ('Tunja'), ('Duitama'), ('Sogamoso'),
    ('Girardot'), ('Fusagasugá'), ('Zipaquirá'), ('Facatativá'),
    ('Chía'), ('Mosquera'), ('Madrid'), ('Funza')
)
update public.reportes r
set ciudad = o.nombre
from oficiales o
where translate(lower(r.ciudad), 'áéíóúüñ', 'aeiouun')
    = translate(lower(o.nombre),  'áéíóúüñ', 'aeiouun')
  and r.ciudad <> o.nombre;

-- Lo mismo en adopciones (hoy vacía, pero para que no se desincronice).
with oficiales(nombre) as (
  values
    ('Manizales'), ('Villamaría'), ('Pereira'), ('Dosquebradas'),
    ('Cali'), ('Quibdó'), ('Armenia'), ('Popayán'), ('Bogotá'), ('Medellín')
)
update public.adopciones a
set ciudad = o.nombre
from oficiales o
where translate(lower(a.ciudad), 'áéíóúüñ', 'aeiouun')
    = translate(lower(o.nombre),  'áéíóúüñ', 'aeiouun')
  and a.ciudad <> o.nombre;

-- ---------------------------------------------------------------------------
-- PASO 4 — Verificar
--
-- Volver a correr esto y comparar con el PASO 1. Si queda alguna ciudad rara,
-- pásamela y la agrego a la lista de arriba: la app la sigue mostrando, solo
-- que no la agrupa en los filtros ni le da página propia.
-- ---------------------------------------------------------------------------
select ciudad, count(*) as reportes
from public.reportes
group by ciudad
order by reportes desc, ciudad;
