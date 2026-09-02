import Script from "next/script";

/**
 * Píxel de Meta — SOC-906-A.
 *
 * Solo `PageView`. Los eventos de conversión (`ViewContent`, `Search`,
 * `Contact`, y `Lead` por CAPI) son `SOC-906-B` y no van acá.
 *
 * POR QUÉ EXISTE: sin píxel, el dinero de la pauta no deja audiencia. Se puede
 * medir una conversión por el servidor, pero **no se puede volver a hablar con
 * quien ya visitó el sitio** — y esa es la única forma de que un presupuesto
 * pequeño construya algo en vez de evaporarse. Está razonado en `SOC-015`.
 *
 * WPO-001 y D-18 — VA CON `lazyOnload`, COMO GA4, Y POR LO MISMO.
 *
 * El comentario de `Analytics.tsx` fija la regla y acá se aplica igual:
 *
 *   «el sitio lo abre gente con mala señal buscando a su mascota, y medir no
 *    puede costarle a nadie encontrarla».
 *
 * El píxel son ~70 KB que compiten con la foto de la mascota por el ancho de
 * banda de un Android de gama media en 4G. Con `lazyOnload` se carga después
 * del evento `load`, así que no le quita nada al primer pintado. El precio es
 * el mismo que ya se aceptó para GA4: una visita abandonada en el primer
 * segundo puede no registrarse.
 *
 * **Nada de `afterInteractive` y nada de `preload`.** Si alguien cambia esto,
 * Next emite un `<link rel="preload">` hacia `connect.facebook.net` en el
 * `<head>` y el navegador lo pide antes de que exista la foto en pantalla. Es
 * exactamente lo que `WPO-001` sacó de la ventana crítica.
 *
 * SIN ID NO HACE NADA, y es a propósito.
 *
 * El Dataset de Meta todavía no existe: crearlo es el paso 2 de `SOC-906-A` y
 * es de Alejo. Este componente se puede desplegar hoy sin ningún efecto — no
 * pinta nada, no pide nada — y se enciende poniendo `NEXT_PUBLIC_META_PIXEL_ID`
 * en Vercel. Ni un cambio de código más.
 *
 * A diferencia de `NEXT_PUBLIC_GA_ID`, acá NO hay valor por defecto: inventar
 * un ID de píxel manda eventos al Dataset de otro. Sin variable, silencio.
 *
 * LO QUE NO SE MANDA, NUNCA:
 * nombre de mascota, teléfono, ni nada derivado de `contacto_whatsapp` — ni
 * hasheado. `D-05` sacó ese campo del JSON público por una razón, y mandarlo a
 * Meta lo reintroduce por la puerta de atrás. `PageView` no lleva parámetros,
 * así que hoy esto se cumple solo; la advertencia es para `SOC-906-B`.
 *
 * SOBRE EL ORDEN DE CARGA, para quien implemente `SOC-906-B`:
 * el fragmento oficial de Meta trae su propia cola (`n.queue`), así que las
 * llamadas a `fbq()` posteriores al `load` funcionan sin más. Los eventos de
 * B se disparan por interacción de la persona —abrir una ficha, tocar el
 * WhatsApp—, que siempre ocurre después. **Si aun así aparece un evento que se
 * pierda por llegar demasiado pronto, ese es el mismo problema de `AN-004` y se
 * resuelve donde corresponde**: sacando el shim a un script en línea temprano,
 * no parcheando acá.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export default function PixelMeta() {
  // En desarrollo no medimos: ensuciaría el Dataset con nuestras propias
  // visitas, igual que en Analytics.tsx.
  if (process.env.NODE_ENV !== "production" || !PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
