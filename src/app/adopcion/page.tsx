import type { Metadata } from "next";
import { ogPagina } from "@/lib/seo";
import ListadoAdopcion from "@/components/ListadoAdopcion";

export const dynamic = "force-dynamic";

/**
 * Esta página se indexa siempre, tenga o no publicaciones.
 *
 * Antes llevaba noindex mientras estuviera vacía (SEO-005): ofrecerle a Google
 * una página que promete «perros y gatos en adopción» y no muestra ninguno es
 * contenido vacío. El argumento sigue siendo cierto, pero es decisión del
 * proyecto indexarla desde ya para que empiece a acumular antigüedad y no
 * tener que esperar a la primera publicación.
 *
 * Si Google la deja en «Rastreada, no indexada» un tiempo, no es un error del
 * código: es el buscador diciendo justo eso. Se resuelve solo cuando haya
 * adopciones reales publicadas.
 */
export function generateMetadata(): Metadata {
  return {
    title: "Perros y gatos en adopción en Colombia — Find Your Pet CO",
    description:
      "Mascotas que buscan hogar definitivo en Colombia. Adopción gratuita y contacto directo por WhatsApp con quien las está cuidando.",
    alternates: { canonical: "/adopcion" },
    openGraph: ogPagina({
      ruta: "/adopcion",
      titulo: "Perros y gatos en adopción en Colombia",
      descripcion:
        "Mascotas que buscan hogar definitivo en Colombia. Adopción gratuita y contacto directo por WhatsApp con quien las está cuidando.",
    }),
  };
}

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function PaginaAdopcion({ searchParams }: { searchParams: Params }) {
  return <ListadoAdopcion ciudad={null} params={await searchParams} />;
}
