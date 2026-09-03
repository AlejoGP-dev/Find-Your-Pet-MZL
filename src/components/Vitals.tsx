"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * WPO-028 — Mide Core Web Vitals de gente real y los manda a GA4.
 *
 * Hasta ahora todo lo que sabíamos de rendimiento venía de pruebas en
 * laboratorio. Esto responde la pregunta que importa: ¿cuánto tarda de verdad
 * la página de alguien buscando a su perro desde un Android con 3G en
 * Manizales?
 *
 * No añade ningún tercero nuevo ni pide red: `useReportWebVitals` viene con
 * Next y los datos van al GA4 que ya está instalado.
 */
export default function Vitals() {
  useReportWebVitals((metrica) => {
    if (typeof window === "undefined") return;

    // AN-004 — FID se descarta a propósito, no se olvidó.
    //
    // useReportWebVitals emite SEIS métricas, no cinco: además de las de
    // abajo sale FID, que Google retiró como Core Web Vital y sustituyó por
    // INP. En GA4 los nombres de evento NO se borran nunca —el proyecto ya
    // carga para siempre con `an001_control`—, así que no se añade un evento
    // que nadie planeó y que nadie va a mirar. INP ya mide lo que FID
    // intentaba medir, y mejor. Decisión de la mesa en SPEC-TANDA-1 (H-35).
    if (metrica.name === "FID") return;

    // AN-004 — Se llama a gtag() como cualquier otro consumidor.
    //
    // Antes se empujaba un Array a dataLayer a mano, porque con lazyOnload
    // (WPO-001) `gtag` no existía todavía. Pero gtag.js solo reconoce como
    // comando un objeto `arguments`: el Array se quedaba en la cola y se
    // ignoraba en silencio. Ahora el shim vive en el <head> (ver
    // Analytics.tsx → ShimGtag), así que `gtag` está disponible desde el
    // principio y este caso especial desaparece.
    //
    // Si no hay gtag es que GA está apagado —en desarrollo, o sin
    // NEXT_PUBLIC_GA_ID—, y entonces no hay nada que medir.
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;

    gtag(
      "event",
      metrica.name, // LCP, INP, CLS, FCP, TTFB
      {
        // GA4 no admite decimales en métricas: CLS se manda ×1000.
        value: Math.round(metrica.name === "CLS" ? metrica.value * 1000 : metrica.value),
        metric_id: metrica.id,
        metric_rating: metrica.rating, // good | needs-improvement | poor
        // Sin query string a propósito: no queremos búsquedas de la gente
        // convertidas en dimensiones de analítica.
        metric_ruta: window.location.pathname,
        non_interaction: true, // no ensucia la tasa de rebote
      },
    );
  });

  return null;
}
