import type { MetadataRoute } from "next";
import {
  contarAdopcionesPorCiudad,
  contarReportesPorCiudad,
  listarAdopcionesParaSitemap,
  listarParaSitemap,
} from "@/lib/almacen";
import { GUIAS } from "@/lib/consejos";
import { ciudadesDesdeConteo } from "@/lib/ciudades";
import { DIAS_CADUCIDAD, SITIO, UMBRAL } from "@/lib/seo";
import { CIUDADES } from "@/lib/tipos";

/**
 * El sitemap consulta la base de datos, así que se regenera cada hora en vez
 * de en cada petición. Sin esto, cada visita de un bot dispararía tres
 * consultas a Supabase.
 */
export const revalidate = 3600;

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITIO}/`, changeFrequency: "hourly", priority: 1, lastModified: new Date() },
    { url: `${SITIO}/reportar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITIO}/ayudar`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITIO}/consejos`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITIO}/adopcion`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITIO}/adopcion/publicar`, changeFrequency: "monthly", priority: 0.7 },
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
    // GSC-001 · Paso 1 — Saber CUÁL de las dos consultas falla.
    //
    // Las otras dos ya traen su propio .catch(), así que solo estas pueden
    // tumbar el bloque. Cada una re-lanza con su nombre delante: el mensaje de
    // Supabase se conserva tal cual y el control de flujo no cambia —lo sigue
    // atrapando el catch de abajo—, pero el log dice quién murió en vez de
    // dejarnos adivinando entre dos candidatas.
    const [filas, filasAdopcion, porCiudad, adopPorCiudad] = await Promise.all([
      listarParaSitemap().catch((e) => {
        throw new Error(`listarParaSitemap → ${e instanceof Error ? e.message : String(e)}`);
      }),
      listarAdopcionesParaSitemap().catch(() => []),
      contarReportesPorCiudad().catch((e) => {
        throw new Error(
          `contarReportesPorCiudad → ${e instanceof Error ? e.message : String(e)}`,
        );
      }),
      contarAdopcionesPorCiudad().catch(() => ({}) as Record<string, number>),
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
    // GSC-001 · Paso 1 — Dejar de fallar en silencio.
    //
    // Este catch lleva días activo en producción y nadie se enteró: el sitemap
    // servía 19 URLs con estado «Correcto» mientras se perdían las 147 fichas,
    // que son el 88 % del contenido. Un fallback que miente y además no deja
    // rastro es la peor combinación posible.
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

    // Sin base de datos servimos al menos el esqueleto: las 8 ciudades que
    // llevan meses publicadas, que es lo que no puede desaparecer del índice
    // porque Supabase tuvo un mal minuto.
    //
    // OJO: esta política es justo lo que discute el Paso 2 del handoff — hoy
    // emite ciudades por debajo del umbral y contradice a SEO-006. No se toca
    // hasta tener el log de arriba; primero el diagnóstico, después la cura.
    ciudades = CIUDADES.map((c) => ({
      url: `${SITIO}/${c.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    }));
  }

  // Con ~150 URLs un solo archivo es correcto. Al pasar de ~10.000 habrá que
  // migrar a generateSitemaps() y servir un índice.
  return [...estaticas, ...ciudades, ...ciudadesAdopcion, ...fichas, ...adopciones];
}
