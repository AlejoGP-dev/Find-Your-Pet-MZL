import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListadoAdopcion from "@/components/ListadoAdopcion";
import { contarAdopcionesPorCiudad } from "@/lib/almacen";
import { UMBRAL } from "@/lib/seo";
import { resolverPorSlug } from "@/lib/ciudades";

export const dynamic = "force-dynamic";

type Ruta = Promise<{ ciudad: string }>;
type Consulta = Promise<Record<string, string | string[] | undefined>>;

// SEO-014: acá había un generateStaticParams() que force-dynamic anulaba —
// código inerte que hacía creer que la ruta se prerenderizaba. Si algún día se
// pasa a `revalidate`, reactivarlo con CIUDADES.map((c) => ({ ciudad: c.slug })).

export async function generateMetadata({ params }: { params: Ruta }): Promise<Metadata> {
  const { ciudad: slug } = await params;
  const ciudad = resolverPorSlug(slug);
  if (!ciudad) return {};
  const titulo = `Perros y gatos en adopción en ${ciudad.nombre} — Find Your Pet CO`;
  const descripcion = `Mascotas que buscan hogar en ${ciudad.nombre}, ${ciudad.departamento}. Adopción gratuita y contacto directo por WhatsApp.`;
  // SEO-005: hoy estas 8 páginas están vacías. Siguen respondiendo 200 —quien
  // llega buscando adopciones en su ciudad merece ver "todavía no hay,
  // publica tú"— pero dejan de ofrecerse a Google hasta que tengan contenido.
  const disponibles = await contarAdopcionesPorCiudad()
    .then((c) => c[ciudad.nombre] ?? 0)
    .catch(() => 0);
  const indexable = disponibles >= UMBRAL.adopcionCiudad;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/adopcion/${ciudad.slug}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: titulo,
      description: descripcion,
      siteName: "Find Your Pet CO",
      type: "website",
      locale: "es_CO",
      url: `/adopcion/${ciudad.slug}`,
    },
  };
}

export default async function AdopcionCiudad({
  params,
  searchParams,
}: {
  params: Ruta;
  searchParams: Consulta;
}) {
  const { ciudad: slug } = await params;
  const ciudad = resolverPorSlug(slug);
  if (!ciudad) notFound();
  return <ListadoAdopcion ciudad={ciudad} params={await searchParams} />;
}
