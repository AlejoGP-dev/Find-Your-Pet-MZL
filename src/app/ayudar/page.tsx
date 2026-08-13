import type { Metadata } from "next";
import Link from "next/link";
import {
  NECESIDADES,
  ORGANIZACIONES,
  colorDe,
  inicialesDe,
} from "@/lib/organizaciones";

export const metadata: Metadata = {
  title: "Fundaciones y albergues que necesitan ayuda — Find Your Pet MZL",
  description:
    "Fundaciones, albergues y personas que cuidan animales en Manizales y Villamaría. Qué necesitan y cómo contactarlas para ayudar.",
};

const ICONOS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  whatsapp: "💬",
  facebook: "👥",
};

export default function PaginaAyudar() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>

      <h1 className="text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
        Quienes cuidan a los que nadie reclama
      </h1>
      <p className="mt-4 max-w-2xl text-base text-stone-600 sm:text-lg">
        Después del sismo, las fundaciones y albergues de Manizales y Villamaría
        recibieron muchos más animales de los que ya tenían. Casi todos se
        sostienen con lo que la gente dona. Si puedes aportar algo, por poquito
        que sea, acá están.
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-extrabold text-stone-900">Qué necesitan</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {NECESIDADES.map((n) => (
            <li
              key={n.texto}
              className="rounded-full bg-marca-suave px-3.5 py-2 text-sm font-bold text-marca-oscuro"
            >
              {n.emoji} {n.texto}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {ORGANIZACIONES.map((org) => (
          <article
            key={org.nombre}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              {org.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={org.logo}
                  alt={`Logo de ${org.nombre}`}
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-stone-100"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white"
                  style={{ backgroundColor: colorDe(org.nombre) }}
                >
                  {inicialesDe(org.nombre)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold leading-tight text-stone-900">
                  {org.nombre}
                </h2>
                {org.zona && (
                  <p className="mt-0.5 text-sm font-semibold text-marca">📍 {org.zona}</p>
                )}
                {org.etiqueta && (
                  <span className="mt-1.5 inline-block rounded-full bg-encontrada-suave px-2.5 py-1 text-xs font-bold text-encontrada">
                    🏠 {org.etiqueta}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 flex-1 text-stone-600">{org.descripcion}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {org.enlaces.map((e) => (
                <a
                  key={e.url}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-700 transition hover:border-marca hover:bg-marca-suave hover:text-marca-oscuro"
                >
                  {ICONOS[e.icono] ?? "🔗"} {e.etiqueta}
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>

      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="font-bold">Ojo:</strong> Find Your Pet MZL no recibe ni
        administra donaciones, ni intermedia. Contacta directo a cada fundación y
        confirma con ellas qué necesitan y dónde entregarlo antes de comprar nada.
      </p>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center">
        <p className="font-bold text-stone-800">
          ¿Conoces otra fundación, albergue o persona que necesite ayuda?
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Escríbeme y la agrego a esta lista.
        </p>
        <a
          href="https://www.instagram.com/ialejog"
          target="_blank"
          rel="noopener noreferrer"
          className="boton-secundario mt-4"
        >
          📸 Escribirme por Instagram
        </a>
      </div>
    </div>
  );
}
