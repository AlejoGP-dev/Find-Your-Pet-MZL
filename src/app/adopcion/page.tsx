import type { Metadata } from "next";
import ListadoAdopcion from "@/components/ListadoAdopcion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perros y gatos en adopción en Colombia — Find Your Pet CO",
  description:
    "Mascotas que buscan hogar definitivo en Colombia. Adopción gratuita y contacto directo por WhatsApp con quien las está cuidando.",
  alternates: { canonical: "/adopcion" },
};

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function PaginaAdopcion({ searchParams }: { searchParams: Params }) {
  return <ListadoAdopcion ciudad={null} params={await searchParams} />;
}
