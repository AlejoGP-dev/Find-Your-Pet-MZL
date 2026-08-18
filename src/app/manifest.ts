import type { MetadataRoute } from "next";

/**
 * SEO-022: mucha gente vuelve a abrir esta página varias veces al día mientras
 * busca a su mascota. El manifest permite "añadir a la pantalla de inicio" y
 * que se abra como una app en lugar de dentro del navegador.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Find Your Pet CO — Mascotas perdidas y encontradas en Colombia",
    short_name: "Find Your Pet",
    description:
      "Reporta y busca mascotas perdidas o encontradas en Colombia. Gratis, sin registro y con contacto directo por WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6f0",
    // Mismo valor que viewport.themeColor en el layout: si uno cambia, cambian los dos.
    theme_color: "#0f6f6c",
    lang: "es-CO",
    categories: ["social", "utilities"],
    icons: [
      { src: "/isotipo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/isotipo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
