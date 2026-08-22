import type { Metadata } from "next";
import { ogPagina } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import Icono, { type NombreIcono } from "@/components/Icono";
import { REDES } from "@/lib/redes";
import {
  CIUDADES_CON_ORGS,
  GRUPOS_DIFUSION,
  NECESIDADES,
  ORGANIZACIONES,
  colorDe,
  inicialesDe,
} from "@/lib/organizaciones";

export const metadata: Metadata = {
  title: "Fundaciones y albergues que necesitan ayuda — Find Your Pet CO",
  description:
    "Fundaciones, albergues y personas que cuidan animales en Colombia. Qué necesitan y cómo contactarlas para ayudar.",
  alternates: { canonical: "/ayudar" },
  openGraph: ogPagina({
    ruta: "/ayudar",
    titulo: "Fundaciones y albergues que necesitan ayuda",
    descripcion:
      "Fundaciones, albergues y personas que cuidan animales en Colombia. Qué necesitan y cómo contactarlas para ayudar.",
  }),
};

const ICONOS: Record<string, NombreIcono> = {
  instagram: "instagram",
  tiktok: "musica",
  whatsapp: "whatsapp",
  facebook: "personas",
  web: "web",
  prensa: "prensa",
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
        Después del sismo, las fundaciones y albergues de las ciudades afectadas
        recibieron muchos más animales de los que ya tenían — y a varios se les
        cayó el refugio encima. Casi todos se sostienen con lo que la gente dona.
        Si puedes aportar algo, por poquito que sea, acá están.
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-extrabold text-stone-900">Qué necesitan</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {NECESIDADES.map((n) => (
            <li
              key={n.texto}
              className="rounded-full bg-marca-suave px-3.5 py-2 text-sm font-bold text-marca-oscuro"
            >
              {n.texto} <Icono nombre={n.icono} className="h-[1em] w-[1em]" />
            </li>
          ))}
        </ul>
      </section>

      {CIUDADES_CON_ORGS.map((ciudad) => {
        const orgs = ORGANIZACIONES.filter((o) => o.ciudad === ciudad);
        return (
          <section key={ciudad} className="mt-8">
            <h2 className="text-xl font-extrabold text-stone-900">
              {ciudad} <Icono nombre="ubicacion" className="h-[1em] w-[1em]" />
              <span className="ml-2 text-sm font-bold text-stone-400">
                {orgs.length}
              </span>
            </h2>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {orgs.map((org) => (
                <article
                  key={org.nombre}
                  className={`flex flex-col rounded-2xl border bg-white p-5 ${
                    org.afectadaSismo
                      ? "border-perdida/40 ring-1 ring-perdida/20"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {org.logo ? (
                      // SEO-021: los 5 logos viven en /public/fundaciones. Con
                      // width/height explícitos no hay salto de layout.
                      <Image
                        src={org.logo}
                        alt={`Logo de ${org.nombre}`}
                        width={56}
                        height={56}
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
                      <h3 className="text-lg font-extrabold leading-tight text-stone-900">
                        {org.nombre}
                      </h3>
                      {org.zona && (
                        <p className="mt-0.5 text-sm font-semibold text-marca">
                          {org.zona}{" "}
                          <Icono nombre="ubicacion" className="h-[1em] w-[1em]" />
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {org.afectadaSismo && (
                          <span className="rounded-full bg-perdida-suave px-2.5 py-1 text-xs font-bold text-perdida">
                            Afectada por el sismo{" "}
                            <Icono nombre="sirena" className="h-[1em] w-[1em]" />
                          </span>
                        )}
                        {org.etiqueta && (
                          <span className="rounded-full bg-encontrada-suave px-2.5 py-1 text-xs font-bold text-encontrada">
                            {org.etiqueta}{" "}
                            <Icono nombre="casa" className="h-[1em] w-[1em]" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-stone-600">{org.descripcion}</p>

                  {org.necesita && (
                    <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                      <strong className="font-bold text-stone-900">Necesita:</strong>{" "}
                      {org.necesita}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {org.enlaces.map((e) => (
                      <a
                        key={e.url}
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-700 transition hover:border-marca hover:bg-marca-suave hover:text-marca-oscuro"
                      >
                        {e.etiqueta}
                        <Icono nombre={ICONOS[e.icono] ?? "enlace"} />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-extrabold text-stone-900">
          Grupos donde también puedes difundir{" "}
          <Icono nombre="megafono" className="h-[1em] w-[1em]" />
        </h2>
        <p className="mt-1 text-stone-600">
          Comunidades de Facebook con miles de personas atentas a mascotas
          perdidas y encontradas. Publica tu reporte acá y compártelo también
          allá: entre más gente lo vea, más rápido aparece.
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {GRUPOS_DIFUSION.map((g) => (
            <li key={g.url}>
              <a
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full items-center gap-3 rounded-xl border border-stone-300 p-3.5 transition hover:border-marca hover:bg-marca-suave"
              >
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1877F2]/10 text-xl"
                >
                  <Icono nombre="personas" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold leading-snug text-stone-800">
                    {g.nombre}
                  </span>
                  <span className="block text-xs text-stone-500">
                    Grupo de Facebook
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs text-stone-500">
          Estos grupos son de la comunidad, no los administra Find Your Pet CO.
          Cada uno tiene sus propias reglas para publicar.
        </p>
      </section>

      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="font-bold">Ojo:</strong> Find Your Pet CO no recibe ni
        administra donaciones, ni intermedia. Contacta directo a cada fundación y
        confirma con ellas qué necesitan y dónde entregarlo antes de comprar nada.
        En emergencias circulan cuentas y enlaces falsos: verifica siempre a quién
        le estás consignando.
      </p>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center">
        <p className="font-bold text-stone-800">
          ¿Conoces otra fundación, albergue o persona que necesite ayuda?
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Escríbeme y la agrego a esta lista.
        </p>
        {/* GSC-002 — Antes esto apuntaba al Instagram personal. Ahora manda a
            las cuentas de la marca, que son las que atienden el proyecto. */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {REDES.map((red) => (
            <a
              key={red.nombre}
              href={red.url}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-secundario"
            >
              {red.nombre}
              <Icono nombre={red.icono} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
