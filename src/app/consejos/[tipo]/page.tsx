import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIAS, guiaPorSlug } from "@/lib/consejos";

type Ruta = Promise<{ tipo: string }>;

export function generateStaticParams() {
  return GUIAS.map((g) => ({ tipo: g.slug }));
}

export async function generateMetadata({ params }: { params: Ruta }): Promise<Metadata> {
  const { tipo } = await params;
  const guia = guiaPorSlug(tipo);
  if (!guia) return {};
  return {
    title: `${guia.titulo} — Find Your Pet CO`,
    description: guia.descripcion,
    alternates: { canonical: `/consejos/${guia.slug}` },
    openGraph: { title: guia.titulo, description: guia.descripcion, locale: "es_CO" },
  };
}

export default async function PaginaConsejos({ params }: { params: Ruta }) {
  const { tipo } = await params;
  const guia = guiaPorSlug(tipo);
  if (!guia) notFound();

  const otra = GUIAS.find((g) => g.slug !== guia.slug)!;
  const esPerdida = guia.slug === "perdida";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>

      <h1 className="text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
        {guia.titulo}
      </h1>
      <p className="mt-4 text-base text-stone-600 sm:text-lg">{guia.intro}</p>

      <Link
        href={`/reportar?tipo=${guia.slug}`}
        className="boton-primario mt-6 w-full sm:w-auto"
      >
        {esPerdida ? "😿 Publicar que se perdió" : "🐕 Publicar que la encontré"}
      </Link>

      {/* Índice: en una guía larga, poder saltar importa */}
      <nav className="mt-8 rounded-2xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
          En esta guía
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {guia.bloques.map((b) => (
            <li key={b.id}>
              <a
                href={`#${b.id}`}
                className="inline-block rounded-full bg-stone-100 px-3 py-1.5 text-sm font-bold text-stone-700 transition hover:bg-marca-suave hover:text-marca-oscuro"
              >
                {b.emoji} {b.titulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-8">
        {guia.bloques.map((bloque) => (
          <section
            key={bloque.id}
            id={bloque.id}
            className={`scroll-mt-20 rounded-2xl border p-5 sm:p-6 ${
              bloque.alerta
                ? "border-amber-300 bg-amber-50"
                : "border-stone-200 bg-white"
            }`}
          >
            <h2 className="text-xl font-extrabold leading-tight text-stone-900 sm:text-2xl">
              {bloque.emoji} {bloque.titulo}
            </h2>
            {bloque.entradilla && (
              <p className="mt-2 text-stone-600">{bloque.entradilla}</p>
            )}

            <ol className="mt-5 space-y-5">
              {bloque.pasos.map((paso, i) => (
                <li key={paso.titulo} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                      bloque.alerta
                        ? "bg-amber-200 text-amber-900"
                        : "bg-marca-suave text-marca-oscuro"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-extrabold leading-snug text-stone-900">
                      {paso.titulo}
                    </h3>
                    <p className="mt-1 text-stone-600">{paso.texto}</p>
                    {paso.dato && (
                      <p className="mt-2 rounded-xl bg-stone-50 px-3.5 py-2.5 text-sm font-bold text-stone-800">
                        📌 {paso.dato}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/consejos/${otra.slug}`}
          className="rounded-2xl border-2 border-stone-300 p-5 transition hover:border-marca hover:bg-marca-suave"
        >
          <span className="block text-lg font-extrabold text-stone-900">
            {otra.slug === "perdida"
              ? "😿 Se me perdió una mascota"
              : "🐕 Me encontré una mascota"}
          </span>
          <span className="mt-1 block text-sm text-stone-600">
            Ver la otra guía
          </span>
        </Link>
        <Link
          href="/ayudar"
          className="rounded-2xl border-2 border-marca/30 bg-marca-suave p-5 transition hover:border-marca"
        >
          <span className="block text-lg font-extrabold text-marca-oscuro">
            💚 Fundaciones y albergues
          </span>
          <span className="mt-1 block text-sm text-stone-700">
            Quiénes están cuidando animales y qué necesitan
          </span>
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-stone-500">
        Esta guía se apoya en la investigación de{" "}
        <a
          href="https://www.missinganimalresponse.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          Missing Animal Response Network
        </a>{" "}
        sobre comportamiento de mascotas perdidas, y en el estudio de la
        Universidad de Queensland sobre distancias recorridas por gatos. No
        reemplaza el criterio de un veterinario ni de un rescatista.
      </p>
    </div>
  );
}
