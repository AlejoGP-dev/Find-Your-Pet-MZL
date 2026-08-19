"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icono, { type NombreIcono } from "@/components/Icono";

const OPCIONES: {
  href: string;
  icono: NombreIcono;
  texto: string;
  detalle: string;
}[] = [
  { href: "/", icono: "casa", texto: "Inicio", detalle: "Todos los reportes" },
  {
    href: "/adopcion",
    icono: "hogar",
    texto: "Adopción",
    detalle: "Perros y gatos que buscan familia",
  },
  {
    href: "/consejos",
    icono: "buscar",
    texto: "Guías de búsqueda",
    detalle: "Qué hacer si se perdió o si te encontraste una",
  },
  {
    href: "/ayudar",
    icono: "corazon",
    texto: "Fundaciones y albergues",
    detalle: "Quiénes necesitan ayuda y cómo aportar",
  },
];

/**
 * Menú de móvil. El botón de publicar NO va acá: se queda siempre visible en
 * el header porque es la acción principal de la página.
 */
export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  // Al cambiar de página el menú se cierra solo. Se ajusta durante el render
  // y no en un efecto: así React no pinta un cuadro con el menú abierto sobre
  // la página nueva antes de cerrarlo.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;

    const conTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const conClic = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) setAbierto(false);
    };

    document.addEventListener("keydown", conTecla);
    document.addEventListener("mousedown", conClic);
    return () => {
      document.removeEventListener("keydown", conTecla);
      document.removeEventListener("mousedown", conClic);
    };
  }, [abierto]);

  return (
    <div className="relative sm:hidden" ref={panel}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        className="grid h-10 w-10 place-items-center rounded-xl border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100"
      >
        {abierto ? (
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {abierto && (
        <div
          id="menu-movil"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
        >
          <nav className="flex flex-col p-1.5">
            {OPCIONES.map((o) => {
              const activa =
                o.href === "/" ? ruta === "/" : ruta.startsWith(o.href);
              return (
                <Link
                  key={o.href}
                  href={o.href}
                  className={`rounded-xl px-3 py-2.5 transition ${
                    activa ? "bg-marca-suave" : "hover:bg-stone-100"
                  }`}
                >
                  <span
                    className={`block font-bold ${
                      activa ? "text-marca-oscuro" : "text-stone-800"
                    }`}
                  >
                    {o.texto}{" "}
                    <Icono
                      nombre={o.icono}
                      className="h-[1em] w-[1em]"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-stone-500">
                    {o.detalle}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
