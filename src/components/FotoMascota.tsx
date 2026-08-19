"use client";

import { getImageProps } from "next/image";
import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";

/**
 * Foto de la ficha con zoom dentro de la misma página: al pasar el mouse se
 * acerca ahí mismo y se mueve con el puntero, sin abrir nada aparte. En
 * celulares no hay mouse, así que el toque abre la foto a pantalla completa
 * y se arrastra con el dedo.
 */
/** Proporción de respaldo para las fotos publicadas antes de la migración 06,
 *  que no tienen medidas guardadas. Vertical porque casi todas lo son. */
const PROPORCION_RESPALDO = 3 / 4;

/** Topes de cordura: una foto larguísima no puede empujar la ficha 3 pantallas. */
const MAS_ALTA = 0.55;
const MAS_ANCHA = 1.9;

export default function FotoMascota({
  src,
  alt,
  emoji = "🐾",
  ancho = null,
  alto = null,
}: {
  src: string | null;
  alt: string;
  emoji?: string;
  /** WPO-003: medidas reales guardadas al publicar. Con ellas la caja reserva
   *  la proporción exacta y la foto no salta ni queda con franjas. */
  ancho?: number | null;
  alto?: number | null;
}) {
  const proporcion =
    ancho && alto && ancho > 0 && alto > 0
      ? Math.min(MAS_ANCHA, Math.max(MAS_ALTA, ancho / alto))
      : PROPORCION_RESPALDO;
  // WPO-018: la versión grande solo se precarga cuando el puntero entra en la
  // foto, que es cuando el zoom va a hacer falta de verdad.
  const [precargar, setPrecargar] = useState(false);

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
    <div
      className="foto-mascota bg-stone-100"
      onMouseEnter={() => setPrecargar(true)}
      style={{ "--proporcion-foto": String(proporcion) } as React.CSSProperties}
    >
      {/* WPO-018: `zoomPreload` iba atado a "hay mouse", que se resuelve al
          montar: en escritorio se descargaban DOS versiones de la misma foto
          (828 y 1080 px) sin que nadie hubiera hecho zoom. Ahora la grande se
          pide en el primer mouseenter. */}
      <InnerImageZoom
        src={vista.src}
        zoomSrc={grande.src}
        zoomType="hover"
        moveType="pan"
        zoomPreload={precargar}
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
          // WPO-003: sin width/height el hueco vale 0 px hasta que llegan los
          // primeros bytes, y la página entera saltaba (CLS medido: 0,2537 en
          // la ruta más compartida del sitio). getImageProps ya devuelve estas
          // dimensiones arriba; simplemente no se estaban reenviando.
          width: vista.width,
          height: vista.height,
        }}
      />
    </div>
  );
}
