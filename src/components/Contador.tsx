"use client";

import { useEffect, useState } from "react";

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
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (hasta <= 0) return;

    const sinAnimacion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (sinAnimacion) {
      setValor(hasta);
      return;
    }

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
  }, [hasta, duracion]);

  return (
    <span className={className} suppressHydrationWarning>
      {valor}
    </span>
  );
}
