import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import DatosEstructurados from "@/components/DatosEstructurados";
import FotoMascota from "@/components/FotoMascota";
import GestionAdopcion from "@/components/GestionAdopcion";
import Icono, { type NombreIcono } from "@/components/Icono";
import Migas, { type Miga } from "@/components/Migas";
import { obtenerAdopcion } from "@/lib/almacen";
import {
  CONVIVENCIAS,
  EDADES,
  ESPECIES_ADOPCION,
  TERNARIAS,
  VACUNAS,
  enlaceWhatsappAdopcion,
  etiquetaAdopcion,
} from "@/lib/adopciones";
import * as schema from "@/lib/schema";
import { recortar } from "@/lib/seo";
import { resolverPorNombre } from "@/lib/ciudades";
import { SEXOS, TAMANOS, etiquetaDe, haceCuanto } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await obtenerAdopcion(id).catch(() => null);
  if (!a) return { title: "Publicación no encontrada — Find Your Pet CO" };
  const nombre = a.nombre || "Mascota";
  const titulo = `${nombre} busca hogar en ${a.ciudad} — Find Your Pet CO`;
  const base = `${nombre} está en adopción en ${a.barrio}, ${a.ciudad}. Adopción gratuita y contacto directo por WhatsApp.`;
  const descripcion = recortar(a.descripcion ? `${base} ${a.descripcion}` : base);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/adopcion/mascota/${id}` },
    openGraph: {
      title: titulo,
      description: descripcion,
      siteName: "Find Your Pet CO",
      type: "article",
      locale: "es_CO",
      url: `/adopcion/mascota/${id}`,
      images: a.foto_url ? [{ url: a.foto_url, alt: `Foto de ${nombre}` }] : undefined,
    },
  };
}

async function urlActual(id: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const protocolo =
    h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocolo}://${host}/adopcion/mascota/${id}`;
}

export default async function FichaAdopcion({ params }: Props) {
  const { id } = await params;
  const a = await obtenerAdopcion(id).catch(() => null);
  if (!a) notFound();

  const especie = ESPECIES_ADOPCION.find((e) => e.valor === a.especie);
  const url = await urlActual(id);

  const datos: { rotulo: string; valor: string | null; icono?: NombreIcono }[] = [
    { rotulo: "Tipo", valor: especie?.etiqueta ?? null, icono: especie?.icono },
    { rotulo: "Edad", valor: etiquetaAdopcion(EDADES, a.edad) },
    { rotulo: "Raza", valor: a.raza },
    { rotulo: "Color", valor: a.color },
    { rotulo: "Tamaño", valor: etiquetaDe(TAMANOS, a.tamano) },
    { rotulo: "Sexo", valor: etiquetaDe(SEXOS, a.sexo) },
    { rotulo: "Esterilizado", valor: etiquetaAdopcion(TERNARIAS, a.esterilizado) },
    { rotulo: "Vacunas", valor: etiquetaAdopcion(VACUNAS, a.vacunas) },
    { rotulo: "Desparasitado", valor: etiquetaAdopcion(TERNARIAS, a.desparasitado) },
    { rotulo: "Ciudad", valor: a.ciudad },
    { rotulo: "Barrio o zona", valor: a.barrio },
    { rotulo: "Se entrega con", valor: a.entrego_con },
  ];

  const convive = CONVIVENCIAS.filter((c) => a.convive_con?.includes(c.valor));

  const ciudadCatalogo = resolverPorNombre(a.ciudad);
  const ruta: Miga[] = [
    { etiqueta: "Inicio", href: "/" },
    { etiqueta: "Adopción", href: "/adopcion" },
    {
      etiqueta: `Adopción en ${a.ciudad}`,
      href: ciudadCatalogo ? `/adopcion/${ciudadCatalogo.slug}` : undefined,
    },
    { etiqueta: a.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre` },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <DatosEstructurados datos={schema.migas(ruta)} />
      <DatosEstructurados
        datos={schema.ficha({
          titulo: `${a.nombre || "Mascota"} en adopción en ${a.ciudad}`,
          descripcion: a.descripcion || `Mascota en adopción en ${a.barrio}, ${a.ciudad}.`,
          ruta: `/adopcion/mascota/${a.id}`,
          foto: a.foto_url,
          fotoAlt: a.nombre ? `Foto de ${a.nombre}` : undefined,
          publicado: a.created_at,
        })}
      />

      <Migas items={ruta} />

      {a.estado === "adoptado" && (
        <div className="mb-5 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
          Esta mascota ya encontró su familia.{" "}
          <Icono nombre="sparkles" className="h-[1em] w-[1em]" />{" "}
          <Link href="/adopcion?estado=adoptado#listado" className="underline">
            Ver otras adopciones cerradas
          </Link>
        </div>
      )}

      {a.estado === "reservado" && (
        <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center font-bold text-amber-900">
          Esta mascota está reservada: ya hay alguien en proceso de adoptarla.
        </div>
      )}

      <article className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="self-start overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <FotoMascota
            src={a.foto_url}
            alt={a.nombre ? `Foto de ${a.nombre}` : "Foto de la mascota"}
            icono={especie?.icono ?? "huella"}
            ancho={a.foto_ancho}
            alto={a.foto_alto}
          />
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-marca-suave px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro">
                En adopción
              </span>
              {a.es_fundacion && (
                <span className="inline-flex rounded-full bg-encontrada-suave px-3 py-1 text-xs font-bold text-encontrada">
                  Fundación <Icono nombre="institucion" className="h-[1em] w-[1em]" />
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900">
              {a.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
            </h1>
            <p className="mt-1 font-semibold text-marca">
              {a.barrio}, {a.ciudad}{" "}
              <Icono nombre="ubicacion" className="h-[1em] w-[1em]" />
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Publicado <time dateTime={a.created_at}>{haceCuanto(a.created_at)}</time>
            </p>
          </div>

          {a.temperamento && (
            <p className="rounded-xl bg-white p-4 text-stone-700 ring-1 ring-stone-200">
              <strong className="block text-stone-900">Cómo es</strong>
              {a.temperamento}
            </p>
          )}

          {a.descripcion && (
            <p className="rounded-xl bg-white p-4 text-stone-700 ring-1 ring-stone-200">
              {a.descripcion}
            </p>
          )}

          {convive.length > 0 && (
            <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
              <p className="font-bold text-stone-900">Convive bien con</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {convive.map((c) => (
                  <li
                    key={c.valor}
                    className="rounded-full bg-marca-suave px-3 py-1.5 text-sm font-bold text-marca-oscuro"
                  >
                    {c.etiqueta} <Icono nombre={c.icono} className="h-[1em] w-[1em]" />
                  </li>
                ))}
              </ul>
            </div>
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
                    {d.valor}
                  </dd>
                </div>
              ))}
          </dl>

          {a.motivo && (
            <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-700">
              <strong className="block text-stone-900">Por qué se da en adopción</strong>
              {a.motivo}
            </p>
          )}

          {a.estado !== "adoptado" && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">La cuida</p>
              <p className="text-lg font-extrabold text-stone-900">{a.contacto_nombre}</p>
              <a
                href={enlaceWhatsappAdopcion(a, url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:brightness-95"
              >
                Preguntar por {a.nombre || "esta mascota"}
                <Icono nombre="chat" />
              </a>
              <p className="mt-2 text-center text-xs text-stone-500">
                {a.contacto_whatsapp}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <strong className="font-bold">Adoptar es gratis.</strong> Si te piden
            dinero por entregarte la mascota, desconfía. Find Your Pet CO no
            verifica a quien publica ni interviene en la entrega: conoce a la
            mascota en persona antes de decidir.{" "}
            <Link href="/consejos/adoptar" className="font-bold underline">
              Qué preguntar antes de adoptar
            </Link>
          </div>

          <GestionAdopcion id={a.id} estado={a.estado} />
        </div>
      </article>
    </div>
  );
}
