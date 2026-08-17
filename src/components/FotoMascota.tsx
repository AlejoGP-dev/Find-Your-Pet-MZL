"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/** Proporciones límite del recuadro: ni tan panorámico ni tan alto que toque
 *  hacer scroll solo para ver la mascota. 0.6 cubre casi toda foto vertical de
 *  celular y los afiches; más allá de ahí sí dejamos franjas. */
const MAS_ALTA = 0.6;
const MAS_ANCHA = 1.5;

function Lupa({ menos = false }: { menos?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
      <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" />
      {!menos && <line x1="10.5" y1="7.5" x2="10.5" y2="13.5" />}
    </svg>
  );
}

export default function FotoMascota({
  src,
  alt,
  emoji = "🐾",
}: {
  src: string | null;
  alt: string;
  emoji?: string;
}) {
  const [proporcion, setProporcion] = useState<number | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setAmpliado(false);
  }, []);

  /** Mide la foto ya cargada. Va por ref y no solo por onLoad porque si la
   *  imagen viene de la caché termina antes de que React enganche el evento
   *  y el recuadro se quedaba cuadrado. */
  const medir = useCallback((img: HTMLImageElement | null) => {
    if (!img) return;
    const leer = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const real = img.naturalWidth / img.naturalHeight;
      setProporcion(Math.min(MAS_ANCHA, Math.max(MAS_ALTA, real)));
    };
    if (img.complete) leer();
    else img.addEventListener("load", leer, { once: true });
  }, []);

  // Con el visor abierto no queremos que la página de atrás se mueva.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, cerrar]);

  if (!src) {
    return (
      <div className="grid aspect-4/3 w-full place-items-center bg-stone-100 text-7xl opacity-40">
        {emoji}
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative w-full cursor-zoom-in bg-stone-100"
        // Hasta que la foto carga usamos un cuadrado: es el punto medio y
        // evita que la página pegue el brinco al acomodarse.
        style={{ aspectRatio: proporcion ?? 1 }}
        onClick={() => setAbierto(true)}
        role="button"
        tabIndex={0}
        aria-label="Ampliar la foto"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAbierto(true);
          }
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 560px, 100vw"
          quality={75}
          priority
          className="object-contain"
          // El recuadro se acomoda a la foto: las verticales dejan de salir
          // chiquitas entre dos franjas blancas.
          ref={medir}
          onLoad={(e) => medir(e.currentTarget)}
        />

        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-stone-700 shadow-md ring-1 ring-stone-900/10 backdrop-blur transition group-hover:bg-white">
          <Lupa />
          <span className="hidden sm:inline">Ampliar</span>
        </span>
      </div>

      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[70] bg-black/95"
          onClick={cerrar}
        >
          <div
            className={`h-full w-full ${ampliado ? "overflow-auto" : "overflow-hidden"}`}
          >
            <div
              className={`relative ${ampliado ? "h-[220%] w-[220%]" : "h-full w-full"}`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                quality={75}
                className="object-contain"
              />
            </div>
          </div>

          <div
            className="absolute right-3 top-3 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAmpliado((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
              aria-label={ampliado ? "Alejar la foto" : "Acercar la foto"}
            >
              <Lupa menos={ampliado} />
            </button>
            <button
              type="button"
              onClick={cerrar}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl leading-none text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
              aria-label="Cerrar la foto"
            >
              ×
            </button>
          </div>

          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-white/70">
            {ampliado
              ? "Arrastra para moverte por la foto"
              : "Toca la lupa para acercar · toca fuera para cerrar"}
          </p>
        </div>
      )}
    </>
  );
}
