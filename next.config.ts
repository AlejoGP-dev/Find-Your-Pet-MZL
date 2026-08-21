import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Las fotos se transforman en el CDN de Supabase, no en el de Vercel.
     *
     * Historia corta: pasaban por el optimizador de Vercel hasta que se agotó
     * el cupo del plan Hobby. `/_next/image` empezó a responder 402 y las fotos
     * nuevas salían ROTAS, así que se puso `unoptimized: true` para salir del
     * paso. Eso arregló lo roto, pero dejó cada tarjeta de 234 px bajando la
     * foto entera de 1400 px: medido en producción sobre las 125 publicadas,
     * 227 KB de promedio (máximo 473 KB) y 27,7 MB para recorrer el listado.
     *
     * Con el loader propio la foto sale del transformador de Supabase, en WebP
     * y al ancho exacto que pide el navegador: la misma foto pasa de 227 KB a
     * ~29 KB. No toca el cupo de Vercel, y Supabase cobra por imagen ORIGEN al
     * mes —no por variante—, así que las cinco anchuras del `srcset` de una
     * misma foto cuentan como una sola. Ver src/lib/loaderSupabase.ts.
     *
     * Si algún día el transformador de Supabase deja de estar disponible, el
     * camino de vuelta es una línea: quitar `loader`/`loaderFile` y volver a
     * `unoptimized: true`. Las fotos se ven igual, solo pesan más.
     */
    loader: "custom",
    loaderFile: "./src/lib/loaderSupabase.ts",
    // Con loader personalizado Next ya no valida el host, pero la lista se
    // queda: documenta de dónde salen las fotos y vuelve a hacer falta el día
    // que se regrese al optimizador propio.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Next 16 solo permite las calidades declaradas acá.
    qualities: [55, 60, 65, 75],
    // Tamaños que realmente usamos: miniaturas de tarjeta y foto de detalle.
    deviceSizes: [360, 480, 640, 828, 1080],
    imageSizes: [64, 96, 128, 200, 256, 384],
    // 31 días de caché en el CDN antes de volver a pedirle el original a Supabase.
    minimumCacheTTL: 2678400,
  },

  /**
   * El dominio viejo manda al nuevo, con redirección permanente y conservando
   * la ruta.
   *
   * Los afiches que circulan por WhatsApp, la nota de Semana y la de El
   * Espectador apuntan al .vercel.app. Sin esto, esa autoridad se queda en un
   * dominio que vamos a abandonar y Google ve dos sitios idénticos.
   *
   * El `has` de host hace que solo aplique al dominio viejo exacto: los
   * despliegues de vista previa (que tienen otro hostname) siguen navegables,
   * que es justo lo que uno quiere para revisar un cambio antes de publicarlo.
   */
  async redirects() {
    return [
      {
        source: "/:ruta*",
        has: [{ type: "host", value: "find-your-pet-mzl.vercel.app" }],
        destination: "https://find-your-pet.co/:ruta*",
        permanent: true,
      },
      // Por si algún día se activa el www en el DNS: un solo host canónico.
      {
        source: "/:ruta*",
        has: [{ type: "host", value: "www.find-your-pet.co" }],
        destination: "https://find-your-pet.co/:ruta*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
