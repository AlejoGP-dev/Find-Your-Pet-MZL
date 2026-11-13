import { contarReportesPorCiudad } from "./almacen";
import { resolverPorNombre } from "./ciudades";
import { INDEXNOW_KEY, SITIO, UMBRAL, urlAbsoluta } from "./seo";

/**
 * GEO-004: avisa a los buscadores que participan en IndexNow (Bing, Yandex,
 * Seznam, Naver, Yep) de que una URL cambió. Google no participa.
 *
 * Reglas, en este orden de importancia:
 * - **Solo en producción.** En local, en modo demo y en previews no sale nada,
 *   igual que GA4 desde ARCH-007.
 * - **Nunca rompe la respuesta.** Se llama desde `after()`, con timeout corto,
 *   y si falla solo deja un aviso en el log. Publicar sigue en 201.
 * - **Solo URLs.** Ningún dato del reporte va en el aviso.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 5000;

export function indexNowActivo(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export async function avisarIndexNow(rutas: string[]): Promise<void> {
  if (!indexNowActivo() || rutas.length === 0) return;
  try {
    const respuesta = await fetch(
      // Solo para probar el fallo en local; en Vercel no existe.
      process.env.INDEXNOW_ENDPOINT_PRUEBA || ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(SITIO).host,
          key: INDEXNOW_KEY,
          keyLocation: `${SITIO}/${INDEXNOW_KEY}.txt`,
          urlList: rutas.map(urlAbsoluta),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    // 200 y 202 son éxito; cualquier otro código solo se anota.
    if (!respuesta.ok) console.warn(`IndexNow respondió ${respuesta.status}`);
  } catch (error) {
    console.warn(
      "IndexNow no respondió:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Reporte recién publicado: su ficha y, si la ciudad ya es indexable, la
 * página de la ciudad. El umbral es el mismo de `app/[ciudad]/page.tsx`.
 */
export async function avisarReporteNuevo(id: string, ciudad: string): Promise<void> {
  if (!indexNowActivo()) return;
  const rutas = [`/mascota/${id}`];
  try {
    const pagina = resolverPorNombre(ciudad);
    if (pagina) {
      const activos = (await contarReportesPorCiudad())[pagina.nombre] ?? 0;
      if (activos >= UMBRAL.ciudad) rutas.push(`/${pagina.slug}`);
    }
  } catch {
    // Sin conteo no se sabe si la ciudad es indexable: se avisa solo la ficha.
  }
  await avisarIndexNow(rutas);
}
