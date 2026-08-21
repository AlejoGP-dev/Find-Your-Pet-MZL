/**
 * Loader de `next/image` que sirve las fotos por el transformador de Supabase.
 *
 * Por qué existe. Las fotos viven en el bucket público de Supabase. Pasaban por
 * el optimizador de Vercel hasta que se agotó el cupo del plan Hobby: entonces
 * `/_next/image` empezó a responder 402 y las fotos NUEVAS salían rotas, que en
 * una página de mascotas perdidas es el peor error posible. La salida de
 * emergencia fue `unoptimized: true` — servir el original tal cual.
 *
 * El precio de esa salida, medido en producción sobre las 125 fotos publicadas:
 * promedio 227 KB por foto (máximo 473 KB), servidas a ~1400 px para pintarlas
 * en tarjetas de 234 px. Recorrer el listado completo eran 27,7 MB.
 *
 * Supabase transforma imágenes en su propio CDN, así que la misma foto sale en
 * WebP al tamaño exacto que pide el navegador. Medido sobre una foto real:
 *
 *   original .......................... 75,4 KB
 *   render width=480 ...................  46,0 KB
 *   render width=480 + Accept: webp ....  28,9 KB   ← lo que recibe un móvil
 *   render width=240 ...................  25,2 KB
 *
 * El WebP no se pide por parámetro: Supabase negocia el formato con la cabecera
 * `Accept` que el navegador ya manda. Por eso acá no se fuerza `format`.
 *
 * Y lo más importante: esto no consume cupo de Vercel. Las transformaciones las
 * cobra Supabase por imagen ORIGEN al mes, no por variante, así que las cinco
 * anchuras de un mismo `srcset` cuentan como una sola.
 */

/** Marca del bucket público. Solo lo que viva acá se puede transformar. */
const RUTA_PUBLICA = "/storage/v1/object/public/";
const RUTA_RENDER = "/storage/v1/render/image/public/";

/**
 * El navegador comprime cada foto a 1400 px antes de subirla, así que pedir más
 * ancho que eso solo gasta transformación para devolver la misma imagen.
 */
const ANCHO_MAXIMO = 1400;

/** Calidad por defecto. 70 es el punto donde una foto de mascota deja de
 *  distinguirse del original en pantalla de teléfono. */
const CALIDAD_POR_DEFECTO = 70;

export default function loaderSupabase({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Todo lo que no sea del bucket —los logos de `public/`, un `data:` de la
  // previsualización del formulario, el modo demo— sale tal cual. Mandarlo al
  // transformador daría 400 y la imagen no cargaría.
  if (!src.includes(RUTA_PUBLICA)) return src;

  const base = src.split("?")[0].replace(RUTA_PUBLICA, RUTA_RENDER);
  const ancho = Math.min(width, ANCHO_MAXIMO);

  // `resize=contain` es deliberado: muchas fotos son afiches verticales con el
  // número de contacto impreso, y un recorte automático lo esconde.
  return `${base}?width=${ancho}&quality=${quality ?? CALIDAD_POR_DEFECTO}&resize=contain`;
}
