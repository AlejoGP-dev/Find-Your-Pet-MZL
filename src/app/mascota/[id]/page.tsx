import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AccionesReporte from "@/components/AccionesReporte";
import Avistamientos from "@/components/Avistamientos";
import Coincidencias from "@/components/Coincidencias";
import DatosEstructurados from "@/components/DatosEstructurados";
import FotoMascota from "@/components/FotoMascota";
import Icono, { type NombreIcono } from "@/components/Icono";
import Migas, { type Miga } from "@/components/Migas";
import TarjetaReporte, { InsigniaTipo } from "@/components/TarjetaReporte";
import { listarAvistamientos, listarReportes, obtenerReporte } from "@/lib/almacen";
import { buscarCoincidencias } from "@/lib/coincidencias";
import {
  ESPECIES,
  SEXOS,
  TAMANOS,
  enlaceWhatsapp,
  etiquetaDe,
  diasDesde,
  formatearFecha,
  haceCuanto,
} from "@/lib/tipos";
import { resolverPorNombre } from "@/lib/ciudades";
import * as schema from "@/lib/schema";
import { DIAS_CADUCIDAD, recortar } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const reporte = await obtenerReporte(id).catch(() => null);
  if (!reporte) return { title: "Reporte no encontrado — Find Your Pet CO" };

  const nombre = reporte.nombre || "Mascota";
  const accion = reporte.tipo === "perdida" ? "Se perdió" : "Encontrada";
  const especie = ESPECIES.find((e) => e.valor === reporte.especie)?.etiqueta ?? "Mascota";

  // SEO-008: una ficha resuelta no se despublica, cambia de historia. El
  // enlace que ya circula por WhatsApp tiene que seguir funcionando.
  const titulo =
    reporte.estado === "resuelto"
      ? `Reencuentro: ${nombre} volvió a casa en ${reporte.ciudad} — Find Your Pet CO`
      : `${accion}: ${nombre} en ${reporte.barrio}, ${reporte.ciudad} — Find Your Pet CO`;

  // SEO-019: la descripción del usuario sola no dice ni la ciudad ni el
  // estado, y un 27 % de los reportes ni siquiera la tiene. Se compone.
  const base =
    reporte.estado === "resuelto"
      ? `${nombre} ya volvió con su familia en ${reporte.barrio}, ${reporte.ciudad}.`
      : `${accion}: ${especie}${reporte.nombre ? ` ${reporte.nombre}` : ""} en ${reporte.barrio}, ${reporte.ciudad}, el ${formatearFecha(reporte.fecha)}.`;
  const descripcion = recortar(
    reporte.descripcion ? `${base} ${reporte.descripcion}` : base,
  );

  // Caducidad desactivada por defecto (DIAS_CADUCIDAD = 0). Ver lib/seo.ts.
  const caducado =
    DIAS_CADUCIDAD > 0 &&
    reporte.estado === "activo" &&
    diasDesde(reporte.created_at) > DIAS_CADUCIDAD;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/mascota/${id}` },
    robots: caducado ? { index: false, follow: true } : undefined,
    openGraph: {
      title: titulo,
      description: descripcion,
      siteName: "Find Your Pet CO",
      type: "article",
      locale: "es_CO",
      url: `/mascota/${id}`,
      // Sin width/height a propósito: las fotos son de todas las formas y
      // declarar 1200x1200 en una vertical hace que WhatsApp la recorte mal.
      images: reporte.foto_url
        ? [{ url: reporte.foto_url, alt: `Foto de ${nombre}` }]
        : undefined,
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
  const avistamientos = await listarAvistamientos(id).catch(() => []);

  // Cruce automático con el otro lado del listado.
  const candidatos =
    reporte.estado === "activo"
      ? await listarReportes({
          tipo: reporte.tipo === "perdida" ? "encontrada" : "perdida",
          especie: reporte.especie,
          // Sin filtro de ciudad a propósito: el cruce ahora acepta municipios
          // vecinos (RADIO_CRUCE_KM) y filtrar acá dejaría fuera justo los
          // casos que veníamos perdiendo, como Manizales ↔ Villamaría.
          estado: "activo",
        }).catch(() => [])
      : [];
  const coincidencias = buscarCoincidencias(reporte, candidatos);

  const diasPublicado = diasDesde(reporte.created_at);
  const esPerdida = reporte.tipo === "perdida";

  // SEO-012: la ciudad solo se enlaza si tiene landing. Para Bogotá o
  // "Quimbaya, Quindío" la miga se pinta como texto, no como enlace roto.
  const ciudadCatalogo = resolverPorNombre(reporte.ciudad);
  const etiquetaListado = esPerdida
    ? `Mascotas perdidas en ${reporte.ciudad}`
    : `Mascotas encontradas en ${reporte.ciudad}`;
  const ruta: Miga[] = [
    { etiqueta: "Inicio", href: "/" },
    {
      etiqueta: etiquetaListado,
      href: ciudadCatalogo ? `/${ciudadCatalogo.slug}` : undefined,
    },
    { etiqueta: reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre` },
  ];

  // Otras mascotas de la misma ciudad y el mismo estado. Antes una ficha no le
  // pasaba ninguna señal a su página de ciudad.
  const mismaCiudad = (
    await listarReportes({
      tipo: reporte.tipo,
      ciudad: reporte.ciudad,
      estado: "activo",
    }).catch(() => [])
  )
    .filter((r) => r.id !== reporte.id)
    .slice(0, 4);

  const datos: {
    rotulo: string;
    valor: string | null;
    icono?: NombreIcono;
    fecha?: string;
  }[] = [
    { rotulo: "Tipo", valor: especie?.etiqueta ?? null, icono: especie?.icono },
    { rotulo: "Raza", valor: reporte.raza },
    { rotulo: "Color", valor: reporte.color },
    { rotulo: "Tamaño", valor: etiquetaDe(TAMANOS, reporte.tamano) },
    { rotulo: "Sexo", valor: etiquetaDe(SEXOS, reporte.sexo) },
    { rotulo: "Ciudad", valor: reporte.ciudad },
    { rotulo: "Barrio o zona", valor: reporte.barrio },
    { rotulo: "Punto de referencia", valor: reporte.referencia },
    {
      rotulo: esPerdida ? "Se perdió el" : "La encontraron el",
      valor: formatearFecha(reporte.fecha),
      fecha: reporte.fecha,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <DatosEstructurados datos={schema.migas(ruta)} />
      <DatosEstructurados
        datos={schema.ficha({
          titulo: `${etiquetaListado} — ${reporte.nombre || "Mascota"}`,
          descripcion: reporte.descripcion || etiquetaListado,
          ruta: `/mascota/${reporte.id}`,
          foto: reporte.foto_url,
          fotoAlt: reporte.nombre ? `Foto de ${reporte.nombre}` : undefined,
          publicado: reporte.created_at,
        })}
      />

      <Migas items={ruta} />

      {reporte.estado === "resuelto" && (
        <div className="mb-5 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
          Esta mascota ya está de vuelta con su familia.{" "}
          <Icono nombre="sparkles" className="h-[1em] w-[1em]" />{" "}
          <Link href="/?estado=resuelto#reportes" className="underline">
            Ver otros reencuentros
          </Link>
        </div>
      )}

      {reporte.estado === "activo" && diasPublicado >= 30 && (
        <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="font-bold">
            Este reporte lleva {diasPublicado} días publicado.
          </strong>{" "}
          Si la mascota ya apareció, márcala con tu código para que salga del
          listado y las búsquedas queden al día.
        </div>
      )}

      <article className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="self-start overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {/* object-contain: muchas fotos son afiches verticales y recortarlos
              esconde el número de contacto. El recuadro se adapta a la foto y
              se puede ampliar a pantalla completa. */}
          <FotoMascota
            src={reporte.foto_url}
            alt={reporte.nombre ? `Foto de ${reporte.nombre}` : "Foto de la mascota"}
            icono={especie?.icono ?? "huella"}
            ancho={reporte.foto_ancho}
            alto={reporte.foto_alto}
          />
        </div>

        <div className="space-y-5">
          <div>
            <InsigniaTipo tipo={reporte.tipo} />
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900">
              {reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
            </h1>
            <p className="mt-1 font-semibold text-marca">
              {reporte.barrio}
              {reporte.ciudad ? `, ${reporte.ciudad}` : ""}{" "}
              <Icono nombre="ubicacion" className="h-[1em] w-[1em]" />
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Publicado{" "}
              <time dateTime={reporte.created_at}>{haceCuanto(reporte.created_at)}</time>
            </p>
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
                  <dd className="text-right font-semibold text-stone-800">
                    {d.icono && (
                      <Icono nombre={d.icono} className="mr-1.5 h-[1em] w-[1em] align-[-0.125em]" />
                    )}
                    {d.fecha ? <time dateTime={d.fecha}>{d.valor}</time> : d.valor}
                  </dd>
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
                Escribir por WhatsApp
                <Icono nombre="chat" />
              </a>
              <p className="mt-2 text-center text-xs text-stone-500">
                {reporte.contacto_whatsapp}
              </p>
            </div>
          )}

          <Link
            href={`/consejos/${reporte.tipo}`}
            className="block rounded-2xl border border-stone-200 bg-white p-4 text-center font-bold text-marca transition hover:border-marca hover:bg-marca-suave"
          >
            {esPerdida ? (
              <>
                Guía: cómo buscar una mascota perdida{" "}
                <Icono nombre="buscar" className="h-[1em] w-[1em]" />
              </>
            ) : (
              <>
                Guía: qué hacer si te encontraste una mascota{" "}
                <Icono nombre="mano" className="h-[1em] w-[1em]" />
              </>
            )}
          </Link>

          <a
            href={`/api/reportes/${reporte.id}/afiche`}
            className="boton-secundario w-full"
            download
          >
            Descargar afiche para compartir
            <Icono nombre="imagen" />
          </a>

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
      </article>

      {coincidencias.length > 0 && (
        <div className="mt-6">
          <Coincidencias lista={coincidencias} tipo={reporte.tipo} />
        </div>
      )}

      {mismaCiudad.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-stone-900">
            {etiquetaListado}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {mismaCiudad.map((r) => (
              <TarjetaReporte key={r.id} reporte={r} />
            ))}
          </div>
          {ciudadCatalogo && (
            <Link
              href={`/${ciudadCatalogo.slug}`}
              className="mt-4 inline-block font-bold text-marca underline underline-offset-2"
            >
              Ver todas las de {ciudadCatalogo.nombre} →
            </Link>
          )}
        </section>
      )}

      <div className="mt-6">
        <Avistamientos
          reporteId={reporte.id}
          tipo={reporte.tipo}
          resuelto={reporte.estado === "resuelto"}
          iniciales={avistamientos}
        />
      </div>
    </div>
  );
}
