"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const SIN_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

/**
 * Cuenta desde cero hasta el número, con una desaceleración suave.
 * Si la persona pidió menos animaciones en su sistema, muestra el número
 * directo — la cifra importa más que el efecto.
 */
export default function Contador({
  hasta,
  duracion = 1400,
  className,
}: {
  hasta: number;
  duracion?: number;
  className?: string;
}) {
  // La preferencia del sistema es un sistema externo, no un efecto. Además,
  // devolver `true` en el servidor hace que el HTML inicial traiga la cifra
  // real en vez de un 0: mejor para quien no tiene JS y para Google.
  const sinAnimacion = useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(SIN_MOVIMIENTO);
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => window.matchMedia(SIN_MOVIMIENTO).matches,
    () => true,
  );

  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (hasta <= 0 || sinAnimacion) return;

    let cuadro = 0;
    let inicio = 0;

    const avanzar = (ahora: number) => {
      if (!inicio) inicio = ahora;
      const avance = Math.min((ahora - inicio) / duracion, 1);
      // easeOutCubic: arranca rápido y frena al final
      const suavizado = 1 - Math.pow(1 - avance, 3);
      setValor(Math.round(hasta * suavizado));
      if (avance < 1) cuadro = requestAnimationFrame(avanzar);
    };

    cuadro = requestAnimationFrame(avanzar);
    return () => cancelAnimationFrame(cuadro);
  }, [hasta, duracion, sinAnimacion]);

  return (
    <span className={className} suppressHydrationWarning>
      {sinAnimacion ? hasta : valor}
    </span>
  );
}
