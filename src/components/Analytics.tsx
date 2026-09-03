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

/**
 * AN-004 — El shim de gtag, fuera del script que carga tarde.
 *
 * Estas dos líneas vivían dentro del <Script id="ga4" strategy="lazyOnload">
 * de abajo, o sea que `gtag` no existía hasta después del evento `load`.
 * Vitals.tsx no podía llamarlo y encolaba a mano un Array en dataLayer —
 * pero gtag.js solo reconoce como comando un objeto `arguments`, así que
 * esos eventos se quedaban en la cola y se ignoraban EN SILENCIO, sin error
 * de consola. AN-001 lo demostró con un control positivo en producción.
 *
 * Peor todavía: FCP y TTFB se encolan ANTES del `config` de GA4 (medido en
 * AN-004, H-36). Arreglar solo el envoltorio dejando el shim acá abajo no
 * habría salvado esas dos. Por eso el shim sube y no se parchea Vitals.
 *
 * WPO-001 NO se toca: lo que pesa es `gtag/js` (170 KB) y ese sigue en
 * `lazyOnload`, después del `load`. Esto son ~60 bytes en línea, sin red y
 * sin bloquear nada.
 *
 * Va en el <head> del layout. Cualquier consumidor —Vitals hoy, los cinco
 * eventos de negocio del SOCIAL-HANDOFF-REDES mañana— llama a gtag() como
 * cualquiera y desaparece el caso especial.
 */
export function ShimGtag() {
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}",
      }}
    />
  );
}

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
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
