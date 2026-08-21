import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Portada from "@/components/Portada";
import { contarReportesPorCiudad } from "@/lib/almacen";
import { UMBRAL } from "@/lib/seo";
import { resolverPorSlug } from "@/lib/ciudades";
import { canonicalPaginado, paginaDe } from "@/lib/paginacion";

export const dynamic = "force-dynamic";

type Ruta = Promise<{ ciudad: string }>;
type Consulta = Promise<Record<string, string | string[] | undefined>>;

/** Cada ciudad se indexa aparte en Google con su propio título. */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Ruta;
  searchParams: Consulta;
}): Promise<Metadata> {
  const { ciudad: slug } = await params;
  const ciudad = resolverPorSlug(slug);
  if (!ciudad) return {};

  // Paginar no es duplicar: `/manizales?pagina=2` lista otras mascotas, así que
  // se canonicaliza a sí misma. Si apuntara a la página 1, Google dejaría de
  // rastrear las fichas que solo se enlazan desde ahí.
  const pagina = paginaDe(await searchParams);

  const titulo = `Mascotas perdidas y encontradas en ${ciudad.nombre} — Find Your Pet CO`;
  const descripcion = `Reporta y busca mascotas perdidas o encontradas en ${ciudad.nombre}, ${ciudad.departamento}. Gratis, sin registro y con contacto directo por WhatsApp.`;

  // SEO-006: la página existe siempre para el usuario, pero solo se le ofrece
  // a Google cuando tiene algo que mostrar. `follow: true` es deliberado: aunque
  // la ciudad no se indexe, sus enlaces a fichas sí deben rastrearse.
  const activos = await contarReportesPorCiudad()
    .then((c) => c[ciudad.nombre] ?? 0)
    .catch(() => UMBRAL.ciudad);
  const indexable = activos >= UMBRAL.ciudad;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: canonicalPaginado(`/${ciudad.slug}`, pagina) },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: titulo,
      description: descripcion,
      siteName: "Find Your Pet CO",
      type: "website",
      locale: "es_CO",
      url: `/${ciudad.slug}`,
    },
  };
}

// SEO-014: acá había un generateStaticParams() que force-dynamic anulaba —
// código inerte que hacía creer que la ruta se prerenderizaba. Si algún día se
// pasa a `revalidate`, reactivarlo con CIUDADES.map((c) => ({ ciudad: c.slug })).

export default async function PaginaCiudad({
  params,
  searchParams,
}: {
  params: Ruta;
  searchParams: Consulta;
}) {
  const { ciudad: slug } = await params;
  const ciudad = resolverPorSlug(slug);
  if (!ciudad) notFound();

  return <Portada ciudad={ciudad} params={await searchParams} />;
}
