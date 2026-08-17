import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListadoAdopcion from "@/components/ListadoAdopcion";
import { CIUDADES, ciudadPorSlug } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Ruta = Promise<{ ciudad: string }>;
type Consulta = Promise<Record<string, string | string[] | undefined>>;

export function generateStaticParams() {
  return CIUDADES.map((c) => ({ ciudad: c.slug }));
}

export async function generateMetadata({ params }: { params: Ruta }): Promise<Metadata> {
  const { ciudad: slug } = await params;
  const ciudad = ciudadPorSlug(slug);
  if (!ciudad) return {};
  const titulo = `Perros y gatos en adopción en ${ciudad.nombre} — Find Your Pet CO`;
  const descripcion = `Mascotas que buscan hogar en ${ciudad.nombre}, ${ciudad.departamento}. Adopción gratuita y contacto directo por WhatsApp.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/adopcion/${ciudad.slug}` },
    openGraph: { title: titulo, description: descripcion, locale: "es_CO" },
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
  const ciudad = ciudadPorSlug(slug);
  if (!ciudad) notFound();
  return <ListadoAdopcion ciudad={ciudad} params={await searchParams} />;
}
