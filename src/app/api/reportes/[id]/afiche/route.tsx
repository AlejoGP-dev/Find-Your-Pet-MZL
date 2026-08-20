import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { obtenerReporte } from "@/lib/almacen";
import {
  type Especie,
  SEXOS,
  TAMANOS,
  etiquetaDe,
  formatearFecha,
} from "@/lib/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 3001112233 -> 300 111 2233, para que se lea de un vistazo en el afiche. */
function telefonoLegible(numero: string): string {
  const d = numero.replace(/\D/g, "").replace(/^57/, "");
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : numero;
}

/**
 * El afiche se rasteriza con Satori (`ImageResponse`), que no ejecuta
 * componentes propios ni dibuja SVG arbitrario: acá el set de iconos no sirve
 * y el respaldo cuando no hay foto sigue siendo un emoji, con su propio mapa.
 */
const EMOJI_ESPECIE: Record<Especie, string> = {
  perro: "🐶",
  gato: "🐱",
  otro: "🐾",
};

const MARCA = "#0f6f6c";
const CREMA = "#faf6f0";
const PERDIDA = "#c2410c";
const ENCONTRADA = "#047857";

/**
 * WPO-007 — Las fuentes viven en el repositorio, no en Google Fonts.
 *
 * Antes cada afiche disparaba 4 peticiones a fonts.googleapis.com (2 por peso:
 * el CSS y el archivo). Con `force-dynamic` esas peticiones nunca se cacheaban,
 * así que se repetían en cada descarga. Y si Google fallaba, el afiche salía en
 * sans-serif sin que nadie se enterara.
 *
 * Se memoiza a nivel de módulo: la lambda las lee una vez y las reutiliza
 * mientras siga viva.
 */
const cacheFuentes = new Map<number, ArrayBuffer | null>();

async function cargarFuente(peso: number): Promise<ArrayBuffer | null> {
  if (cacheFuentes.has(peso)) return cacheFuentes.get(peso)!;

  let datos: ArrayBuffer | null = null;
  try {
    const bytes = await readFile(
      join(process.cwd(), "public", "fuentes", `nunito-${peso}.ttf`),
    );
    datos = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  } catch {
    // Respaldo: si el archivo no viajó en el despliegue, seguimos como antes
    // en vez de servir el afiche sin tipografía.
    try {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=Nunito:wght@${peso}&display=swap`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      ).then((r) => r.text());
      const url = css.match(/src: url\((https:[^)]+)\)/)?.[1];
      if (url) datos = await fetch(url).then((r) => r.arrayBuffer());
    } catch {
      datos = null;
    }
  }

  cacheFuentes.set(peso, datos);
  return datos;
}

/**
 * WPO-007 — La foto entra por el optimizador de Next, no por el original de
 * Supabase.
 *
 * El original puede pesar 4 MB y el afiche solo necesita 1080 px de ancho.
 * Se descarga acá (en vez de pasarle la URL a Satori) por dos razones: se
 * puede validar antes de rasterizar, y si el optimizador falla se cae al
 * original en vez de reventar el afiche entero.
 */
async function fotoParaAfiche(fotoUrl: string, origen: string): Promise<string> {
  // El optimizador no acepta data: URLs ni orígenes fuera de `remotePatterns`.
  if (!/^https?:/i.test(fotoUrl)) return fotoUrl;

  const optimizada = `${origen}/_next/image?url=${encodeURIComponent(fotoUrl)}&w=1080&q=75`;
  try {
    // El `Accept` explícito NO es opcional: sin él el optimizador negocia AVIF
    // y el rasterizador de `next/og` no sabe decodificarlo — probado, revienta
    // con "Input buffer contains unsupported image format" y se cae el afiche
    // entero, no solo la foto.
    //
    // Por eso también se pasan los bytes y no la URL: si le diéramos la URL,
    // Satori la volvería a pedir con su propio Accept y volvería el AVIF.
    const r = await fetch(optimizada, { headers: { Accept: "image/jpeg" } });
    if (!r.ok) return fotoUrl;
    const tipo = r.headers.get("content-type") || "image/jpeg";
    if (!/jpeg|png/.test(tipo)) return fotoUrl;
    const b64 = Buffer.from(await r.arrayBuffer()).toString("base64");
    return `data:${tipo};base64,${b64}`;
  } catch {
    // Ante cualquier duda, el original: el afiche es lo que la gente imprime
    // y pega en un poste. Mejor pesado que roto.
    return fotoUrl;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reporte = await obtenerReporte(id).catch(() => null);
  if (!reporte) return new Response("Reporte no encontrado", { status: 404 });

  const foto = reporte.foto_url
    ? await fotoParaAfiche(reporte.foto_url, new URL(request.url).origin)
    : null;

  const esPerdida = reporte.tipo === "perdida";
  const acento = esPerdida ? PERDIDA : ENCONTRADA;

  const titulo = esPerdida ? "¡SE PERDIÓ!" : "¿LO CONOCES?";
  const subtitulo = esPerdida
    ? `EN ${reporte.barrio.toUpperCase()}, ${reporte.ciudad.toUpperCase()}`
    : `ENCONTRADA EN ${reporte.barrio.toUpperCase()}, ${reporte.ciudad.toUpperCase()}`;

  const datos = [
    reporte.raza,
    reporte.color,
    etiquetaDe(TAMANOS, reporte.tamano),
    etiquetaDe(SEXOS, reporte.sexo) === "No sé"
      ? null
      : etiquetaDe(SEXOS, reporte.sexo),
  ].filter(Boolean) as string[];

  const [regular, extra] = await Promise.all([cargarFuente(700), cargarFuente(800)]);
  const fuentes = [
    ...(regular ? [{ name: "Nunito", data: regular, weight: 700 as const }] : []),
    ...(extra ? [{ name: "Nunito", data: extra, weight: 800 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CREMA,
          fontFamily: fuentes.length ? "Nunito" : "sans-serif",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: acento,
            padding: "36px 48px 28px",
          }}
        >
          <div style={{ display: "flex", fontSize: 86, fontWeight: 800, color: "#fff", letterSpacing: -2 }}>
            {titulo}
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#ffffffcc", marginTop: 6 }}>
            {subtitulo}
          </div>
        </div>

        {/* Foto */}
        <div
          style={{
            display: "flex",
            width: "1080px",
            height: "620px",
            backgroundColor: "#1c1917",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt=""
              width={1080}
              height={620}
              style={{ width: "1080px", height: "620px", objectFit: "contain" }}
            />
          ) : (
            <div style={{ display: "flex", fontSize: 200 }}>{EMOJI_ESPECIE[reporte.especie] ?? "🐾"}</div>
          )}
        </div>

        {/* Cuerpo */}
        <div style={{ display: "flex", flexDirection: "column", padding: "34px 48px", flex: 1 }}>
          {reporte.nombre && (
            <div style={{ display: "flex", fontSize: 78, fontWeight: 800, color: "#1c1917", lineHeight: 1.1, marginBottom: 16 }}>
              {reporte.nombre}
            </div>
          )}
          {datos.length > 0 && (
            <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#57534e", marginTop: 12 }}>
              {datos.join("  ·  ")}
            </div>
          )}
          {reporte.descripcion && (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 700,
                color: "#44403c",
                marginTop: 18,
                lineHeight: 1.35,
              }}
            >
              {reporte.descripcion.slice(0, 190)}
              {reporte.descripcion.length > 190 ? "…" : ""}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#78716c", marginTop: 16 }}>
            {esPerdida ? "Se perdió el " : "La encontraron el "}
            {formatearFecha(reporte.fecha)}
          </div>
        </div>

        {/* Contacto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1c1917",
            padding: "30px 48px 34px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#d6d3d1" }}>
            SI LA HAS VISTO, COMUNÍCATE CON {reporte.contacto_nombre.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 82, fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
            {telefonoLegible(reporte.contacto_whatsapp)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              color: MARCA === "#0f6f6c" ? "#7dd3d0" : "#fff",
              marginTop: 14,
            }}
          >
            find-your-pet.co · Mascotas perdidas y encontradas en Colombia 🐾
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      ...(fuentes.length ? { fonts: fuentes } : {}),
      headers: {
        "Content-Disposition": `attachment; filename="afiche-${(reporte.nombre || "mascota")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .toLowerCase()}.png"`,
        // WPO-007: `max-age` es directiva de navegador; sin `s-maxage` el CDN de
        // Vercel respondía MISS en cada descarga y se pagaba 1,3 s de CPU y el
        // rasterizado completo otra vez. Un afiche solo cambia si cambia el
        // reporte, así que 24 h es holgado.
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
