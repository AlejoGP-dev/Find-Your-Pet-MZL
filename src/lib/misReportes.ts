"use client";

import { useSyncExternalStore } from "react";

const CLAVE = "fyp-mis-reportes";

type Guardado = { id: string; token: string };

/** Lee el código de gestión que quedó guardado al publicar desde este equipo. */
export function tokenGuardado(id: string): string | null {
  try {
    const lista: Guardado[] = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    return lista.find((r) => r.id === id)?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * `localStorage` es un sistema externo al render, no un efecto secundario.
 *
 * Antes esto se leía en un `useEffect` que hacía `setState` de una: React lo
 * marca como render en cascada, y además provocaba un parpadeo entre el
 * primer pintado y el segundo. `useSyncExternalStore` es la herramienta
 * correcta: en el servidor devuelve null y en el navegador el valor real.
 *
 * No hay suscripción porque nada cambia el valor mientras la página vive: se
 * escribe al publicar, que es justo antes de navegar a la ficha.
 */
export function useTokenGuardado(id: string): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => tokenGuardado(id),
    () => null,
  );
}
