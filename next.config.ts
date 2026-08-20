import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Las fotos se sirven tal como salen de Supabase, sin pasar por el
     * optimizador de Vercel.
     *
     * Por qué: el plan Hobby tiene un cupo de transformaciones y se agotó. A
     * partir de ahí `/_next/image` responde 402 y la foto NO carga — que en
     * una página de mascotas perdidas es el peor error posible, porque la foto
     * es prácticamente todo el contenido. Las que se ven hoy son las que
     * alcanzaron a quedar en caché antes de que se acabara el cupo; las nuevas
     * salían rotas.
     *
     * Se puede hacer porque el navegador ya comprime cada foto ANTES de
     * subirla (ver comprimirImagen en FormularioReporte): máximo 1400 px y
     * JPEG de calidad ~0.8. Medido sobre 30 fotos publicadas: mediana 189 KB,
     * promedio 221 KB, ninguna por encima de 1 MB. No es lo que haría el
     * optimizador, pero es aceptable.
     *
     * Lo que se pierde: AVIF/WebP y el srcset por tamaño, así que una tarjeta
     * de 180 px baja la foto de 1400 px. Lo amortigua el `loading="lazy"`, que
     * hace que solo bajen las tarjetas visibles.
     *
     * El arreglo de verdad es generar una miniatura al publicar y guardarla
     * junto al original: sale gratis (el navegador ya tiene el canvas abierto)
     * y devolvería las tarjetas livianas sin depender del cupo de nadie.
     */
    unoptimized: true,
    // Las fotos viven en el bucket público de Supabase. Al pasarlas por
    // next/image, Vercel las redimensiona y las sirve desde su CDN: Supabase
    // solo entrega el original una vez y dejamos de quemar egress en cada visita.
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
