import type { Metadata } from "next";
import Link from "next/link";
import { GUIAS } from "@/lib/consejos";

export const metadata: Metadata = {
  title: "Guías: cómo buscar una mascota perdida — Find Your Pet CO",
  description:
    "Qué hacer si se te perdió una mascota o si te encontraste una en la calle. Guías con lo que sí funciona según quienes se dedican a rastrearlas.",
  alternates: { canonical: "/consejos" },
};

const ESTILO = {
  perdida: {
    emoji: "😿",
    titulo: "Se me perdió una mascota",
    borde: "border-perdida/30 hover:border-perdida",
    fondo: "bg-perdida-suave",
    texto: "text-perdida",
  },
  encontrada: {
    emoji: "🐕",
    titulo: "Me encontré una mascota",
    borde: "border-encontrada/30 hover:border-encontrada",
    fondo: "bg-encontrada-suave",
    texto: "text-encontrada",
  },
} as const;

export default function IndiceConsejos() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>

      <h1 className="text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
        Guías de búsqueda
      </h1>
      <p className="mt-4 text-base text-stone-600 sm:text-lg">
        Buscar un gato no se parece en nada a buscar un perro, y la mayoría de la
        gente hace justo lo que hace huir al animal. Esto es lo que sí funciona,
        según quienes se dedican a rastrear mascotas perdidas.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIAS.map((g) => {
          const e = ESTILO[g.slug];
          return (
            <Link
              key={g.slug}
              href={`/consejos/${g.slug}`}
              className={`flex flex-col rounded-2xl border-2 p-6 transition ${e.borde} ${e.fondo}`}
            >
              <span className={`text-xl font-extrabold ${e.texto}`}>
                {e.emoji} {e.titulo}
              </span>
              <span className="mt-2 flex-1 text-stone-700">{g.intro}</span>
              <span className="mt-4 flex flex-wrap gap-1.5">
                {g.bloques.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-stone-700"
                  >
                    {b.emoji} {b.titulo}
                  </span>
                ))}
              </span>
              <span className="mt-4 font-bold text-marca-oscuro underline underline-offset-2">
                Leer la guía →
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-stone-300 p-6 text-center">
        <p className="text-lg font-extrabold text-stone-900">
          Lo primero sigue siendo publicar el reporte
        </p>
        <p className="mt-1 text-stone-600">
          Es gratis, sin registro y toma menos de un minuto. Entre más rápido esté
          publicado, más gente está buscando.
        </p>
        <Link href="/reportar" className="boton-primario mt-5">
          Publicar un reporte
        </Link>
      </div>
    </div>
  );
}
