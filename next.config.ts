import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
};

export default nextConfig;
