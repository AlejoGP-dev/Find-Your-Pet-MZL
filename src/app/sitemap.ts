import type { MetadataRoute } from "next";
import {
  contarAdopcionesPorCiudad,
  contarReportesPorCiudad,
  listarAdopcionesParaSitemap,
  listarParaSitemap,
} from "@/lib/almacen";
import { GUIAS } from "@/lib/consejos";
import { ciudadesDesdeConteo } from "@/lib/ciudades";
import { CON_PAGINA } from "@/lib/organizaciones";
import { ADOPCION_CON_CONTENIDO, DIAS_CADUCIDAD, SITIO, UMBRAL } from "@/lib/seo";

/**
 * ARCH-003 — El sitemap se genera en cada petición.
 *
 * Acá vivía `export const revalidate = 3600`, y era mentira. La documentación
 * de Next 16 lo dice en una línea: «sitemap.js es un Route Handler especial
 * que se cachea POR DEFECTO salvo que use una API de tiempo de petición o una
 * opción de configuración `dynamic`». `revalidate` no es una de esas dos
 * cosas, así que la ruta se quedaba prerenderizada en el build y no revalidaba
 * nunca.
 *
 * No es teoría. El 22 de agosto se midió en producción: el documento llevaba
 * ~10 horas idéntico —byte por byte, `age` creciendo 1:1 con el reloj— desde
 * el último despliegue. Cero invocaciones en los logs de Vercel frente a 13
 * peticiones (con una ruta de control que sí aparecía), cero mensajes de la
 * instrumentación del Paso 1 en 11 horas, sin las cabeceras `x-nextjs-prerender`
 * ni `x-nextjs-stale-time` que sí lleva una página ISR de verdad, y un `206`
 * ante una petición de `Range`: se servía como objeto estático del CDN.
 *
 * La consecuencia era de producto, no de SEO: una mascota reportada hoy no
 * entraba al sitemap hasta que alguien desplegara. En un sitio cuyo problema
 * declarado es que Google no descubre las fichas, el canal de descubrimiento
 * estaba desconectado del momento de publicar.
 *
 * Coste: tres consultas a Supabase por petición. El tráfico a un sitemap es de
 * bots y es bajo — no se parece al de una ruta de usuario. Si el TTFB se va por
 * encima de 3 s, el plan es mover esto a `app/sitemap.xml/route.ts` con
 * `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`, que da el mismo
 * resultado con una consulta por hora y un comportamiento que se lee en las
 * cabeceras en vez de adivinarse.
 *
 * OJO con lo que este cambio se lleva por delante: al no prerenderizarse en el
 * build, el escudo del Paso 3 cambia de forma. Antes, si Supabase fallaba los
 * tres intentos durante un despliegue, el build fallaba y Vercel mantenía el
 * anterior. Ahora ese mismo fallo sale como 5xx en la petición. Sigue sin
 * violarse la regla que importa —nunca un `urlset` mutilado con estado 200—,
 * pero el fallo se ve en otro sitio.
 */
export const dynamic = "force-dynamic";

/**
 * Reintenta una consulta antes de darla por perdida.
 *
 * GSC-001 · Paso 3. El fallo es intermitente —el sitemap se degradó durante
 * ~15 minutos el 21 de agosto y se recuperó solo—, y un fallo intermitente es
 * justo el que se arregla reintentando. Tres intentos con espera creciente
 * (300 ms, 600 ms) cubren un timeout puntual o un cold start sin alargar de
 * forma perceptible la regeneración, que corre una vez por hora y no delante
 * de ningún usuario.
 *
 * Cada intento fallido queda registrado: si el sitemap se salva en el segundo
 * intento queremos enterarnos igual, porque eso es la reincidencia que estamos
 * cazando en el Paso 2.
 */
async function conReintento<T>(
  nombre: string,
  consulta: () => Promise<T>,
  intentos = 3,
): Promise<T> {
  let ultimoFallo: unknown;
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await consulta();
    } catch (e) {
      ultimoFallo = e;
      console.warn(
        `[sitemap] GSC-001 · ${nombre} falló (intento ${intento}/${intentos}):`,
        e instanceof Error ? e.message : String(e),
      );
      if (intento < intentos) {
        await new Promise((listo) => setTimeout(listo, 300 * intento));
      }
    }
  }
  throw new Error(
    `${nombre} → ${ultimoFallo instanceof Error ? ultimoFallo.message : String(ultimoFallo)}`,
  );
}

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITIO}/`, changeFrequency: "hourly", priority: 1, lastModified: new Date() },
    { url: `${SITIO}/reportar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITIO}/ayudar`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITIO}/consejos`, changeFrequency: "monthly", priority: 0.7 },
    // SEO-033 — El hub de adopción entra al sitemap solo cuando tiene algo que
    // mostrar. Misma constante que decide su meta `robots`, así que no puede
    // volver a pasar lo de antes: una página vacía, con `noindex`… y enviada a
    // Google en el sitemap.
    ...(ADOPCION_CON_CONTENIDO
      ? [
          {
            url: `${SITIO}/adopcion`,
            changeFrequency: "daily" as const,
            priority: 0.9,
          },
        ]
      : []),
    // `/adopcion/publicar` no depende de eso: es un formulario, intención
    // transaccional, indexable siempre — igual que `/reportar`.
    { url: `${SITIO}/adopcion/publicar`, changeFrequency: "monthly", priority: 0.7 },
    // FEATURE-007 — Las páginas de fundaciones. Salen de `CON_PAGINA`, así que
    // una fundación nueva entra al sitemap sola, sin tocar este archivo.
    // No hay umbral que las bloquee (`D-09` es sobre páginas generadas): son
    // páginas con contenido propio, escrito y verificado.
    ...CON_PAGINA.map((o) => ({
      url: `${SITIO}/fundaciones/${o.pagina.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITIO}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITIO}/datos`, changeFrequency: "yearly", priority: 0.3 },
    ...GUIAS.map((g) => ({
      url: `${SITIO}/consejos/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // Si Supabase falla, el sitemap tiene que seguir sirviendo las estáticas.
  // Un 500 acá hace que Google marque el sitemap como roto durante días.
  let fichas: MetadataRoute.Sitemap = [];
  let adopciones: MetadataRoute.Sitemap = [];
  let ciudades: MetadataRoute.Sitemap = [];
  let ciudadesAdopcion: MetadataRoute.Sitemap = [];

  try {
    // GSC-001 · Pasos 1 y 3 — Reintentar, y saber CUÁL consulta falló.
    //
    // Las de adopciones degradan a vacío a propósito: hoy no hay ni una
    // publicación, así que perderlas no cambia el sitemap. Aun así se
    // registran — un catch mudo es exactamente el bug que estamos arreglando.
    //
    // Las de reportes NO degradan: si alguna se cae después de tres intentos,
    // el error sube y la ruta falla. Ver el catch de abajo.
    const [filas, filasAdopcion, porCiudad, adopPorCiudad] = await Promise.all([
      conReintento("listarParaSitemap", listarParaSitemap),
      listarAdopcionesParaSitemap().catch((e) => {
        console.warn(
          "[sitemap] listarAdopcionesParaSitemap falló, se omiten las adopciones:",
          e instanceof Error ? e.message : String(e),
        );
        return [];
      }),
      conReintento("contarReportesPorCiudad", contarReportesPorCiudad),
      contarAdopcionesPorCiudad().catch((e) => {
        console.warn(
          "[sitemap] contarAdopcionesPorCiudad falló, se omiten sus ciudades:",
          e instanceof Error ? e.message : String(e),
        );
        return {} as Record<string, number>;
      }),
    ]);

    fichas = filas
      // Una ficha caducada deja de ofrecerse a Google, pero la URL sigue viva.
      // Con DIAS_CADUCIDAD = 0 esto no filtra nada (ver lib/seo.ts).
      .filter(
        (r) =>
          !(
            DIAS_CADUCIDAD > 0 &&
            r.estado === "activo" &&
            diasDesde(r.created_at) > DIAS_CADUCIDAD
          ),
      )
      .map((r) => ({
        url: `${SITIO}/mascota/${r.id}`,
        lastModified: new Date(r.created_at),
        changeFrequency: r.estado === "activo" ? ("daily" as const) : ("monthly" as const),
        // Las resueltas se quedan: son historia y tienen enlaces circulando
        // por WhatsApp. Solo pesan menos.
        priority: r.estado === "activo" ? 0.8 : 0.4,
      }));

    adopciones = filasAdopcion.map((a) => ({
      url: `${SITIO}/adopcion/mascota/${a.id}`,
      lastModified: new Date(a.created_at),
      changeFrequency: "weekly" as const,
      priority: a.estado === "disponible" ? 0.8 : 0.4,
    }));

    // SEO-006: las ciudades del sitemap salen de los DATOS, no de un catálogo
    // fijo. Ahora que se puede publicar desde cualquiera de los 1.121
    // municipios, Bogotá o Medellín entran solas al cruzar el umbral y ninguna
    // ciudad vacía se le ofrece a Google.
    ciudades = ciudadesDesdeConteo(porCiudad, UMBRAL.ciudad)
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITIO}/${c.slug}`,
        changeFrequency: "hourly" as const,
        priority: 0.9,
        lastModified: new Date(),
      }));

    ciudadesAdopcion = ciudadesDesdeConteo(adopPorCiudad, UMBRAL.adopcionCiudad)
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITIO}/adopcion/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
  } catch (e) {
    // GSC-001 · Pasos 1 y 3 — Registrar y NO mentir.
    //
    // Se registran los campos por separado y no el objeto pelado: en los logs
    // de Vercel un Error serializado se ve como «{}» y no sirve de nada.
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(
      "[sitemap] GSC-001 · fallo construyendo el sitemap dinámico",
      JSON.stringify({
        mensaje: error.message,
        nombre: error.name,
        causa: error.cause ? String(error.cause) : undefined,
        pila: error.stack?.split("\n").slice(0, 4).join(" | "),
      }),
    );

    // Antes acá se servían las 8 ciudades del catálogo y se devolvía 200. Ese
    // fallback hacía tres cosas malas a la vez: escondía la pérdida del 88 %
    // del sitemap detrás de un «Correcto» en Search Console, le decía a Google
    // que las 147 fichas dejaron de estar declaradas, y emitía cinco ciudades
    // por debajo del umbral que se marcan solas como noindex —contradiciendo a
    // SEO-006 y generando avisos de «URL enviada marcada como noindex»—.
    //
    // Ahora el error sube. Dos finales posibles, los dos honestos:
    //   · Con caché previa (el caso normal en producción), Next sigue sirviendo
    //     el último sitemap bueno y reintenta después. Google no pierde nada.
    //   · Sin caché, la ruta responde 5xx y Search Console reporta «No se ha
    //     podido obtener»: un estado visible y diagnosticable.
    //
    // CONSECUENCIA A TENER PRESENTE: esta ruta se prerenderiza en el build, así
    // que si Supabase falla los tres intentos justo durante un despliegue, el
    // build falla y Vercel mantiene el anterior en producción. Es ruidoso, pero
    // es preferible a publicar un sitemap sin el 88 % del contenido.
    throw error;
  }

  // Con ~150 URLs un solo archivo es correcto. Al pasar de ~10.000 habrá que
  // migrar a generateSitemaps() y servir un índice.
  return [...estaticas, ...ciudades, ...ciudadesAdopcion, ...fichas, ...adopciones];
}
