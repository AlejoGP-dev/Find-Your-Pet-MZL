import { nombreOficial } from "@/lib/ciudades";

/**
 * AN-012 — Eventos de negocio hacia GA4.
 *
 * El shim de gtag vive en el <head> desde AN-004 (ver Analytics.tsx →
 * ShimGtag), así que cualquier componente puede llamar a gtag() sin esperar a
 * que cargue gtag/js: el evento queda en dataLayer y sale cuando llega.
 *
 * Si no hay gtag es que GA está apagado —en desarrollo, o sin
 * NEXT_PUBLIC_GA_ID—, y entonces no hay nada que medir. Nunca lanza: medir no
 * puede tumbar un formulario.
 */
function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof fn !== "function") return;
  try {
    fn(...args);
  } catch {
    /* medir nunca rompe el flujo */
  }
}

/**
 * La ciudad, solo si es un municipio reconocido; si no, «otra».
 *
 * El formulario ya exige un municipio (BUG-002), pero acá se lee lo que hay en
 * el campo y un texto libre puede llevar una referencia de la casa de alguien
 * (D-26). Eso no puede viajar a GA4. Un municipio, en cambio, ya es público en
 * la ficha. Y este comentario no cita ningún caso real a propósito: el
 * repositorio es público (H-59).
 */
function ciudadParaMedir(texto: string): string {
  return nombreOficial(texto) ?? "otra";
}

/**
 * Se llama SOLO cuando el POST respondió 2xx, o sea cuando el reporte ya está
 * guardado. Es la conversión del sitio: en GA4 va marcado como evento clave,
 * y así cada reporte queda atribuido a la fuente de la sesión que lo trajo.
 *
 * Sin datos personales: nada de nombre, WhatsApp, barrio, referencia, id ni
 * token. Solo tres categorías que ya son públicas en la ficha.
 */
export function medirReportePublicado(datos: {
  tipo: string;
  especie: string;
  ciudad: string;
}) {
  gtag("event", "reporte_publicado", {
    tipo: datos.tipo === "encontrada" ? "encontrada" : "perdida",
    especie: datos.especie || "otro",
    ciudad: ciudadParaMedir(datos.ciudad),
  });
}
