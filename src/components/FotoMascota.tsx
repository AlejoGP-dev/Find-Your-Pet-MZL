"use client";

import { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";

/**
 * Foto de la ficha con zoom dentro de la misma página: al pasar el mouse se
 * acerca ahí mismo y se mueve con el puntero, sin abrir nada aparte. En
 * celulares no hay mouse, así que el toque abre la foto a pantalla completa
 * y se arrastra con el dedo.
 */
export default function FotoMascota({
  src,
  alt,
  emoji = "🐾",
}: {
  src: string | null;
  alt: string;
  emoji?: string;
}) {
  // El precargado de la imagen grande solo tiene sentido donde hay mouse:
  // evita el parpadeo al entrar, y en móvil no gastamos datos de más.
  const [hayMouse, setHayMouse] = useState(false);
  useEffect(() => {
    setHayMouse(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (!src) {
    return (
      <div className="grid aspect-4/3 w-full place-items-center bg-stone-100 text-7xl opacity-40">
        {emoji}
      </div>
    );
  }

  // Las dos versiones pasan por el optimizador de Next (AVIF/WebP y caché en
  // el CDN), así que Supabase sigue entregando el original una sola vez.
  const comun = { alt, quality: 75, src };
  const { props: vista } = getImageProps({ ...comun, width: 828, height: 828 });
  const { props: grande } = getImageProps({ ...comun, width: 1080, height: 1080 });

  return (
    <div className="foto-mascota bg-stone-100">
      <InnerImageZoom
        src={vista.src}
        zoomSrc={grande.src}
        zoomType="hover"
        moveType="pan"
        zoomPreload={hayMouse}
        fadeDuration={150}
        fullscreenOnMobile
        mobileBreakpoint={768}
        className="block w-full"
        imgAttributes={{
          alt,
          srcSet: vista.srcSet,
          sizes: "(min-width: 768px) 560px, 100vw",
          fetchPriority: "high",
          className: "w-full",
        }}
      />
    </div>
  );
}
