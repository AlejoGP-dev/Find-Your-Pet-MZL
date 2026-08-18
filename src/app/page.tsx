import type { Metadata } from "next";
import Portada from "@/components/Portada";

export const dynamic = "force-dynamic";

/**
 * SEO-002: el home acepta seis parámetros combinables (tipo, especie, ciudad,
 * barrio, q, estado) y todas esas variantes son 200 rastreables. El canonical
 * las consolida en "/". No se les pone noindex a propósito: eso cortaría el
 * rastreo de las fichas que solo se enlazan desde un listado filtrado.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function Inicio({ searchParams }: { searchParams: Params }) {
  return <Portada ciudad={null} params={await searchParams} />;
}
