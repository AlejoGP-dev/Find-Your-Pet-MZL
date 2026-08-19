import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * WPO-001 — Va con `lazyOnload`, no con `afterInteractive`.
 *
 * Medido: GA son 170.934 B en el cable y 507.657 B de JavaScript a ejecutar,
 * contra 148.987 B de toda la aplicación. Con `afterInteractive`, Next además
 * emitía un <link rel="preload"> en el <head>, así que el navegador lo pedía
 * ANTES de que existiera la foto de la mascota en pantalla.
 *
 * `lazyOnload` lo mueve a después del evento `load`. El precio: una visita
 * abandonada en el primer segundo puede no registrarse. Decisión consciente:
 * el sitio lo abre gente con mala señal buscando a su mascota, y medir no
 * puede costarle a nadie encontrarla.
 *
 * El ID se puede cambiar sin tocar código con NEXT_PUBLIC_GA_ID.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-KFW6L02SZZ";

export default function Analytics() {
  // En desarrollo no medimos: ensuciaría los datos con nuestras propias visitas.
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
