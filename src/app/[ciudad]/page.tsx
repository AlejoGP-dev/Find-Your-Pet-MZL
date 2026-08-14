import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Portada from "@/components/Portada";
import { CIUDADES, ciudadPorSlug } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Ruta = Promise<{ ciudad: string }>;
type Consulta = Promise<Record<string, string | string[] | undefined>>;

/** Cada ciudad se indexa aparte en Google con su propio título. */
export async function generateMetadata({ params }: { params: Ruta }): Promise<Metadata> {
  const { ciudad: slug } = await params;
  const ciudad = ciudadPorSlug(slug);
  if (!ciudad) return {};

  const titulo = `Mascotas perdidas y encontradas en ${ciudad.nombre} — Find Your Pet CO`;
  const descripcion = `Reporta y busca mascotas perdidas o encontradas en ${ciudad.nombre}, ${ciudad.departamento}. Gratis, sin registro y con contacto directo por WhatsApp.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/${ciudad.slug}` },
    openGraph: { title: titulo, description: descripcion, locale: "es_CO" },
  };
}

export function generateStaticParams() {
  return CIUDADES.map((c) => ({ ciudad: c.slug }));
}

export default async function PaginaCiudad({
  params,
  searchParams,
}: {
  params: Ruta;
  searchParams: Consulta;
}) {
  const { ciudad: slug } = await params;
  const ciudad = ciudadPorSlug(slug);
  if (!ciudad) notFound();

  return <Portada ciudad={ciudad} params={await searchParams} />;
}
