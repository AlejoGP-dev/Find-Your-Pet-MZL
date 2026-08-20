/**
 * Constantes y ayudas de SEO en un solo lugar.
 *
 * Vive en `lib/` y no en `app/` a propósito: una ruta no debe ser la fuente
 * de constantes compartidas.
 */

/**
 * Dominio público canónico. Todo lo que Google ve —canonical, Open Graph,
 * sitemap, robots, JSON-LD— sale de acá.
 *
 * OJO con la variable de entorno: si en Vercel quedó apuntando al dominio
 * viejo, manda ella y este valor no se usa. Tiene que apuntar al dominio
 * propio o no existir. Un canonical equivocado es peor que no tener ninguno:
 * le dice a Google que la página buena es otra.
 */
export const SITIO =
  process.env.NEXT_PUBLIC_SITIO?.replace(/\/$/, "") || "https://find-your-pet.co";

/**
 * Open Graph de una página, completo y apuntando a sí misma.
 *
 * Next REEMPLAZA el objeto `openGraph` del layout en vez de mezclarlo. Por eso
 * una página que solo declaraba `title` y `description` heredaba el `url: "/"`
 * del layout y le decía a WhatsApp y a Facebook que la página compartida era
 * la portada. Esta ayuda existe para que no haya que acordarse de repetir
 * `siteName` y `locale` en cada ruta — que es justo lo que se olvida.
 */
export function ogPagina({
  ruta,
  titulo,
  descripcion,
  tipo = "website",
}: {
  ruta: string;
  titulo: string;
  descripcion: string;
  tipo?: "website" | "article";
}) {
  return {
    title: titulo,
    description: descripcion,
    siteName: "Find Your Pet CO",
    locale: "es_CO",
    type: tipo,
    url: ruta,
  } as const;
}

/**
 * Umbrales de indexación. Existen para no publicar páginas vacías: una ciudad
 * sin reportes se le muestra igual al usuario, pero no se le ofrece a Google
 * como si tuviera contenido.
 *
 * Con los datos de hoy, `ciudad: 3` deja indexables Manizales, Villamaría y
 * Pereira, y deja fuera las que están en 0 o 1. Se ajusta acá, no por el código.
 */
export const UMBRAL = {
  /** Reportes activos mínimos para que una ciudad sea indexable. */
  ciudad: 3,
  /** Publicaciones mínimas para que una ciudad de adopción sea indexable. */
  adopcionCiudad: 1,
} as const;

/**
 * Días tras los cuales un reporte activo deja de ofrecerse a Google.
 *
 * DESACTIVADO a propósito (0 = nunca caduca). Los reportes del sismo del 10 de
 * agosto de 2026 saldrían todos del índice a la vez al cumplir el plazo, y esa
 * es una decisión del responsable del proyecto, no del código. Para activarlo,
 * poner 90 (o 180 si se prefiere más margen).
 */
export const DIAS_CADUCIDAD = 0;

/**
 * Recorta en el último espacio antes del límite, para que ninguna meta
 * description termine cortando una palabra por la mitad.
 */
export function recortar(texto: string, max = 155): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const espacio = corte.lastIndexOf(" ");
  return (espacio > 0 ? corte.slice(0, espacio) : corte).replace(/[,;:.\-–—]$/, "") + "…";
}

/** Convierte una ruta relativa en absoluta contra SITIO. */
export function urlAbsoluta(ruta: string): string {
  return ruta.startsWith("http") ? ruta : `${SITIO}${ruta.startsWith("/") ? "" : "/"}${ruta}`;
}
