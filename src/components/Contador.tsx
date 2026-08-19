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

  // El navegador congela requestAnimationFrame en las pestañas de segundo
  // plano. Si la página carga ahí (un clic con Cmd, una sesión restaurada),
  // la animación nunca arranca y el contador se queda mostrando 0 — una cifra
  // falsa sobre datos reales. Mientras la pestaña esté oculta se muestra el
  // número tal cual; cuando la persona la mira, ahí sí se anima.
  const oculto = useSyncExternalStore(
    (avisar) => {
      document.addEventListener("visibilitychange", avisar);
      return () => document.removeEventListener("visibilitychange", avisar);
    },
    () => document.hidden,
    () => false,
  );

  const animando = !sinAnimacion && !oculto && hasta > 0;

  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!animando) return;

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

    // Red de seguridad: si por lo que sea la animación se quedó a medias
    // (la pestaña pasó a segundo plano, el hilo se atascó), el contador
    // termina en la cifra correcta de todos modos.
    const red = setTimeout(() => setValor(hasta), duracion + 600);

    return () => {
      cancelAnimationFrame(cuadro);
      clearTimeout(red);
    };
  }, [hasta, duracion, animando]);

  return (
    <span className={className} suppressHydrationWarning>
      {animando ? valor : hasta}
    </span>
  );
}
