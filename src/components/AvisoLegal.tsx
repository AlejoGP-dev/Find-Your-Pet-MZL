"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CLAVE = "fyp-aviso-legal-visto";

/**
 * Aviso permanente arriba del header.
 *
 * Va acá y no en un modal a propósito: la gente entra a esta página en medio
 * de una emergencia y un pop-up que tape la pantalla solo estorba. Se puede
 * cerrar, y queda cerrado — pero se ve completo antes de cualquier otra cosa.
 */
export default function AvisoLegal() {
  // Arranca oculto y aparece tras hidratar: así nunca parpadea para quien ya
  // lo cerró.
  const [visible, setVisible] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CLAVE) !== "1") setVisible(true);
    } catch {
      setVisible(true); // si el navegador bloquea el almacenamiento, se muestra
    }
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      /* no pasa nada */
    }
  }

  if (!visible) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 text-amber-950">
      <div className="mx-auto flex w-full max-w-5xl items-start gap-3 px-4 py-2.5">
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-base">
          ⚠️
        </span>

        <div className="min-w-0 flex-1 text-sm leading-snug">
          <p>
            <strong className="font-bold">
              Nunca envíes dinero para recuperar tu mascota.
            </strong>{" "}
            Find Your Pet CO no recibe ni administra donaciones, no cobra nada y
            no interviene en ningún acuerdo entre personas.{" "}
            {!ampliado && (
              <button
                type="button"
                onClick={() => setAmpliado(true)}
                className="font-bold underline underline-offset-2"
              >
                Ver más
              </button>
            )}
          </p>

          {ampliado && (
            <div className="mt-2 space-y-2">
              <p>
                Esta página solo le da visibilidad a los reportes que publica la
                comunidad y a fundaciones que trabajan con animales. No
                verificamos la identidad de quien publica ni la veracidad de la
                información, y no somos parte de ninguna entrega, negociación ni
                transacción.
              </p>
              <p>
                <strong className="font-bold">Cuídate de las estafas:</strong>{" "}
                si alguien dice tener tu mascota y te pide plata por adelantado
                —para transporte, veterinario o &laquo;rescate&raquo;— es la
                señal más común de engaño. Pide una seña que solo quien la tenga
                pueda saber y haz los encuentros de día, en un lugar público y
                acompañado.
              </p>
              <p>
                Si vas a donarle a una fundación, confirma directamente con
                ellas antes de consignar. Nosotros no recogemos ni entregamos
                donaciones de ningún tipo.{" "}
                <Link href="/consejos/perdida#estafas" className="font-bold underline underline-offset-2">
                  Más sobre estafas
                </Link>
              </p>
              <button
                type="button"
                onClick={() => setAmpliado(false)}
                className="font-bold underline underline-offset-2"
              >
                Ver menos
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar aviso"
          className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-amber-900 transition hover:bg-amber-100"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
