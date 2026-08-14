import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * Va con strategy="afterInteractive" para que se cargue después de que la
 * página ya es usable: el sitio lo abre gente con datos móviles y mala señal,
 * y medir no puede costarle a nadie encontrar a su mascota.
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
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
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
