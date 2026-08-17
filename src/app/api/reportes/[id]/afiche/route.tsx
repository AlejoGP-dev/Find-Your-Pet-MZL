import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { obtenerReporte } from "@/lib/almacen";
import {
  ESPECIES,
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

const MARCA = "#0f6f6c";
const CREMA = "#faf6f0";
const PERDIDA = "#c2410c";
const ENCONTRADA = "#047857";

async function cargarFuente(peso: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Nunito:wght@${peso}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:[^)]+)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reporte = await obtenerReporte(id).catch(() => null);
  if (!reporte) return new Response("Reporte no encontrado", { status: 404 });

  const esPerdida = reporte.tipo === "perdida";
  const acento = esPerdida ? PERDIDA : ENCONTRADA;
  const especie = ESPECIES.find((e) => e.valor === reporte.especie);

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
          {reporte.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reporte.foto_url}
              alt=""
              width={1080}
              height={620}
              style={{ width: "1080px", height: "620px", objectFit: "contain" }}
            />
          ) : (
            <div style={{ display: "flex", fontSize: 200 }}>{especie?.emoji ?? "🐾"}</div>
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
            find-your-pet-mzl.vercel.app · Mascotas perdidas y encontradas en Colombia 🐾
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
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
