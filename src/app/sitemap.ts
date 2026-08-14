import type { MetadataRoute } from "next";
import { GUIAS } from "@/lib/consejos";
import { CIUDADES } from "@/lib/tipos";

/** Dominio público. Se puede cambiar sin tocar código con NEXT_PUBLIC_SITIO. */
export const SITIO =
  process.env.NEXT_PUBLIC_SITIO?.replace(/\/$/, "") ||
  "https://find-your-pet-mzl.vercel.app";

/**
 * Le dice a Google que existe una página por ciudad. Sin esto tardaría
 * semanas en descubrir /pereira, /cali y las demás.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITIO}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITIO}/reportar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITIO}/ayudar`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITIO}/consejos`, changeFrequency: "monthly", priority: 0.7 },
    ...GUIAS.map((g) => ({
      url: `${SITIO}/consejos/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CIUDADES.map((c) => ({
      url: `${SITIO}/${c.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
  ];
}
