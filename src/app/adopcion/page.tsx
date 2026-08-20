import type { Metadata } from "next";
import { ogPagina } from "@/lib/seo";
import ListadoAdopcion from "@/components/ListadoAdopcion";
import { contarAdopciones } from "@/lib/almacen";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  // SEO-005: mientras no haya ni una publicación, esta página no tiene nada
  // que ofrecerle a Google. Se queda en el sitemap (es una sección real del
  // sitio) pero con noindex hasta que alguien publique la primera.
  const total = await contarAdopciones()
    .then((t) => t.disponibles + t.adoptadas)
    .catch(() => 1);

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
    robots: total > 0 ? undefined : { index: false, follow: true },
  };
}

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function PaginaAdopcion({ searchParams }: { searchParams: Params }) {
  return <ListadoAdopcion ciudad={null} params={await searchParams} />;
}
