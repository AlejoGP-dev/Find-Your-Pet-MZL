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
    // Empuja directo a dataLayer en vez de llamar a gtag(): GA se carga con
    // lazyOnload (WPO-001) y una métrica puede dispararse antes. La cola de
    // dataLayer existe desde el primer momento y GA la procesa al llegar.
    if (typeof window === "undefined") return;
    const dl = ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []);

    dl.push([
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
    ]);
  });

  return null;
}
