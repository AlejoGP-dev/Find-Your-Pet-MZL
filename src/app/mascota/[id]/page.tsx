import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AccionesReporte from "@/components/AccionesReporte";
import { InsigniaTipo } from "@/components/TarjetaReporte";
import { obtenerReporte } from "@/lib/almacen";
import {
  ESPECIES,
  SEXOS,
  TAMANOS,
  enlaceWhatsapp,
  etiquetaDe,
  formatearFecha,
} from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const reporte = await obtenerReporte(id).catch(() => null);
  if (!reporte) return { title: "Reporte no encontrado — Find Your Pet MZL" };

  const nombre = reporte.nombre || "Mascota";
  const accion = reporte.tipo === "perdida" ? "Se perdió" : "Encontrada";
  const titulo = `${accion}: ${nombre} en ${reporte.barrio} — Find Your Pet MZL`;
  return {
    title: titulo,
    description:
      reporte.descripcion ||
      `${accion} en ${reporte.barrio}, Manizales, el ${formatearFecha(reporte.fecha)}.`,
    openGraph: {
      title: titulo,
      images: reporte.foto_url ? [reporte.foto_url] : undefined,
    },
  };
}

async function urlActual(id: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const protocolo = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocolo}://${host}/mascota/${id}`;
}

export default async function PaginaMascota({ params }: Props) {
  const { id } = await params;
  const reporte = await obtenerReporte(id).catch(() => null);
  if (!reporte) notFound();

  const especie = ESPECIES.find((e) => e.valor === reporte.especie);
  const url = await urlActual(id);
  const esPerdida = reporte.tipo === "perdida";

  const datos: { rotulo: string; valor: string | null }[] = [
    { rotulo: "Tipo", valor: especie ? `${especie.emoji} ${especie.etiqueta}` : null },
    { rotulo: "Raza", valor: reporte.raza },
    { rotulo: "Color", valor: reporte.color },
    { rotulo: "Tamaño", valor: etiquetaDe(TAMANOS, reporte.tamano) },
    { rotulo: "Sexo", valor: etiquetaDe(SEXOS, reporte.sexo) },
    { rotulo: "Barrio o zona", valor: reporte.barrio },
    { rotulo: "Punto de referencia", valor: reporte.referencia },
    {
      rotulo: esPerdida ? "Se perdió el" : "La encontraron el",
      valor: formatearFecha(reporte.fecha),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>

      {reporte.estado === "resuelto" && (
        <div className="mb-5 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
          🎉 Esta mascota ya está de vuelta con su familia.{" "}
          <Link href="/?estado=resuelto#reportes" className="underline">
            Ver otros reencuentros
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="self-start overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {reporte.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reporte.foto_url}
              alt={reporte.nombre ? `Foto de ${reporte.nombre}` : "Foto de la mascota"}
              className="max-h-[28rem] w-full object-cover"
            />
          ) : (
            <div className="grid aspect-4/3 w-full place-items-center bg-stone-100 text-7xl opacity-40">
              {especie?.emoji ?? "🐾"}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <InsigniaTipo tipo={reporte.tipo} />
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900">
              {reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
            </h1>
            <p className="mt-1 font-semibold text-marca">📍 {reporte.barrio}</p>
          </div>

          {reporte.descripcion && (
            <p className="rounded-xl bg-white p-4 text-stone-700 ring-1 ring-stone-200">
              {reporte.descripcion}
            </p>
          )}

          <dl className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {datos
              .filter((d) => d.valor)
              .map((d) => (
                <div key={d.rotulo} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-stone-500">{d.rotulo}</dt>
                  <dd className="text-right font-semibold text-stone-800">{d.valor}</dd>
                </div>
              ))}
          </dl>

          {reporte.estado === "activo" && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">Publicado por</p>
              <p className="text-lg font-extrabold text-stone-900">
                {reporte.contacto_nombre}
              </p>
              <a
                href={enlaceWhatsapp(reporte, url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:brightness-95"
              >
                💬 Escribir por WhatsApp
              </a>
              <p className="mt-2 text-center text-xs text-stone-500">
                {reporte.contacto_whatsapp}
              </p>
            </div>
          )}

          <AccionesReporte
            id={reporte.id}
            tipo={reporte.tipo}
            resuelto={reporte.estado === "resuelto"}
          />

          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            Por seguridad: pide señas o fotos que solo el dueño pueda conocer, no envíes
            dinero por adelantado y prefiere encontrarte en un lugar público.
          </p>
        </div>
      </div>
    </div>
  );
}
