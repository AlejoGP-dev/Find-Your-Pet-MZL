import type { Metadata } from "next";
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

export default async function PaginaAdopcion({ searchParams }: { searchParams: Params }) {
  return <ListadoAdopcion ciudad={null} params={await searchParams} />;
}
