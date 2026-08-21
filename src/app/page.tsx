import type { Metadata } from "next";
import Portada from "@/components/Portada";
import { canonicalPaginado, paginaDe } from "@/lib/paginacion";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

/**
 * SEO-002: el home acepta seis parámetros combinables (tipo, especie, ciudad,
 * barrio, q, estado) y todas esas variantes son 200 rastreables. El canonical
 * las consolida en "/". No se les pone noindex a propósito: eso cortaría el
 * rastreo de las fichas que solo se enlazan desde un listado filtrado.
 *
 * La excepción es `?pagina=N`: paginar no es duplicar. La página 2 lista
 * mascotas distintas de la 1, así que se canonicaliza a sí misma. Si apuntara
 * a "/", Google dejaría de rastrear las fichas que solo se enlazan desde ahí.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Params;
}): Promise<Metadata> {
  const pagina = paginaDe(await searchParams);
  return { alternates: { canonical: canonicalPaginado("/", pagina) } };
}

export default async function Inicio({ searchParams }: { searchParams: Params }) {
  return <Portada ciudad={null} params={await searchParams} />;
}
