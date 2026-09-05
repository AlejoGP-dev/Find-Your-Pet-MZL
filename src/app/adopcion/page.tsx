import type { Metadata } from "next";
import Link from "next/link";
import Icono from "@/components/Icono";
import Migas from "@/components/Migas";
import { ADOPCION_CON_CONTENIDO, ogPagina } from "@/lib/seo";
import ListadoAdopcion from "@/components/ListadoAdopcion";

export const dynamic = "force-dynamic";

const TITULO = "Perros y gatos en adopción en Colombia — Find Your Pet CO";
const DESCRIPCION =
  "Mascotas que buscan hogar definitivo en Colombia. Adopción gratuita y contacto directo por WhatsApp con quien las está cuidando.";

/**
 * SEO-033 — Metadata estática. Cero `await`, cero Supabase.
 *
 * La página sigue viva, en 200 y enlazada desde el header, el hero y el footer:
 * quien entre la ve igual que siempre. Lo único que cambia es que, mientras no
 * haya ni una publicación, no se le ofrece a Google.
 *
 * Por qué importa la palabra «estática»: acá hubo antes un `generateMetadata`
 * asíncrono que consultaba Supabase solo para decidir el `noindex`, y esa
 * consulta es una de las tres implicadas en `SEO-031`. Quitarla fue correcto.
 * Este arreglo NO la reintroduce — la decisión sale de una constante
 * (`ADOPCION_CON_CONTENIDO` en lib/seo.ts), que es la misma que gobierna la
 * entrada del sitemap. Una sola fuente para las dos, y por eso no pueden
 * volver a contradecirse.
 */
export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/adopcion" },
  robots: { index: ADOPCION_CON_CONTENIDO, follow: true },
  openGraph: ogPagina({
    ruta: "/adopcion",
    titulo: "Perros y gatos en adopción en Colombia",
    descripcion: DESCRIPCION,
  }),
};

type Params = Promise<Record<string, string | string[] | undefined>>;

/**
 * FEATURE-006 — Mientras la sección no tenga oferta real, la ruta sigue viva.
 *
 * **No se devuelve 404 y es a propósito.** Google ya conoció esta URL y puede
 * haber enlaces sueltos hacia ella. Un 404 deja a la persona sin explicación y
 * le suma un error al dominio; una página que dice la verdad —«todavía no hay
 * nada»— no hace ninguna de las dos cosas.
 *
 * Tampoco se promete fecha. Depende de que las fundaciones acepten (SOC-012),
 * y eso no lo decide el código.
 */
function AdopcionEnPreparacion() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Migas items={[{ etiqueta: "Inicio", href: "/" }, { etiqueta: "Adopción" }]} />

      <h1 className="mt-6 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
        Estamos armando esta sección junto a fundaciones aliadas
      </h1>

      <p className="mt-4 text-base text-stone-600 sm:text-lg">
        Todavía no hay mascotas en adopción publicadas. Preferimos no mostrar una
        lista vacía y avisarte cuando haya algo de verdad.
      </p>

      <p className="mt-4 text-base text-stone-600 sm:text-lg">
        Mientras tanto, si se te perdió una mascota o te encontraste una, ahí sí
        podemos ayudarte hoy mismo.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/reportar?tipo=perdida" className="boton-primario">
          Perdí a mi mascota
          <Icono nombre="perdida" />
        </Link>
        <Link
          href="/reportar?tipo=encontrada"
          className="boton-secundario border-encontrada/40 text-encontrada"
        >
          Encontré una mascota
          <Icono nombre="encontrada" />
        </Link>
      </div>

      <p className="mt-8 text-base text-stone-600">
        ¿Tienes una fundación o un albergue?{" "}
        <Link href="/ayudar" className="font-bold text-marca underline">
          Mira a quiénes estamos apoyando
        </Link>
        .
      </p>
    </div>
  );
}

export default async function PaginaAdopcion({ searchParams }: { searchParams: Params }) {
  if (!ADOPCION_CON_CONTENIDO) return <AdopcionEnPreparacion />;
  return <ListadoAdopcion ciudad={null} params={await searchParams} />;
}
